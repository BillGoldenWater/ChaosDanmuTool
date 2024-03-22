use bson::serde_helpers::chrono_datetime_as_bson_datetime;
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use ed25519_dalek::{ed25519::signature::SignerMut, SigningKey, Verifier, VerifyingKey};
use itertools::Itertools as _;
use once_cell::sync::Lazy;
use rand::{rngs::OsRng, Rng};

use crate::{
    data_primitives::{auth_key_id::AuthKeyId, auth_signature::AuthSignature},
    define_data_type,
    utils::{functional::Functional, hash::hash_md5},
};

define_data_type!(
    struct RequestSigned {
        #[serde(with = "chrono_datetime_as_bson_datetime")]
        timestamp: DateTime<Utc>,
        rnd: i64,
        key_id: AuthKeyId,
        sign: Box<AuthSignature>,
        #[serde(with = "serde_bytes")]
        body: Vec<u8>,
    }
);

impl RequestSigned {
    pub fn gen(body: Vec<u8>, key_id: AuthKeyId, key: &mut SigningKey) -> RequestSigned {
        let mut result = Self {
            timestamp: Utc::now(),
            rnd: OsRng.gen(),
            key_id,
            sign: AuthSignature::zero().into(),
            body,
        };

        result.do_sign(key);

        result
    }

    fn do_sign(&mut self, key: &mut SigningKey) {
        self.sign = AuthSignature::from_signature(&key.sign(&self.to_msg())).into();
    }

    pub fn verify(&self, key: &VerifyingKey) -> Result<(), VerifyError> {
        static RND_USED: Lazy<DashMap<i64, DateTime<Utc>>> = Lazy::new(DashMap::new);

        fn ts_is_valid(now: DateTime<Utc>, timestamp: &DateTime<Utc>) -> bool {
            now.signed_duration_since(timestamp)
                .num_minutes()
                .saturating_abs()
                <= 10
        }

        key.verify(&self.to_msg(), &self.sign.to_signature())
            .map_err(|_| VerifyError::Signature)?;

        let now = Utc::now();
        if !ts_is_valid(now, &self.timestamp) {
            return VerifyError::Timestamp.into_err();
        }

        // if rnd used and still valid
        if let Some(ts) = RND_USED.get(&self.rnd) {
            if ts_is_valid(now, &ts) {
                return VerifyError::RndUsed.into_err();
            }
        };

        let expired = RND_USED
            .iter()
            .filter(|it| !ts_is_valid(now, it.value()))
            .map(|it| *it.key())
            .collect_vec();
        for rnd in expired {
            RND_USED.remove(&rnd);
        }

        RND_USED.insert(self.rnd, now);

        Ok(())
    }

    fn to_msg(&self) -> Vec<u8> {
        hash_md5(&self.body).into_iter()
            // NOTE: bson::DateTime only has millisecond precision
            .chain(self.timestamp.timestamp_millis().to_le_bytes())
            .chain(self.rnd.to_le_bytes())
            .collect()
    }

    pub fn key_id(&self) -> &AuthKeyId {
        &self.key_id
    }

    pub fn into_body(self) -> Vec<u8> {
        self.body
    }
}

define_data_type!(
    @derive_ext(thiserror::Error)
    enum VerifyError {
        #[error("invalid signature")]
        Signature,
        #[error("invalid timestamp")]
        Timestamp,
        #[error("rnd used")]
        RndUsed,
    }
);

#[cfg(test)]
mod tests {
    use chrono::TimeDelta;

    use super::*;

    fn prepare_data() -> (Vec<u8>, AuthKeyId, SigningKey, VerifyingKey) {
        let sk = SigningKey::generate(&mut OsRng);
        let pk = sk.verifying_key();
        ((1..=128).collect(), AuthKeyId::new(), sk, pk)
    }

    #[test]
    fn test_sign_normal() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSigned::gen(body, id, &mut sk);

        assert_eq!(sign.verify(&pk), Ok(()));
    }

    #[test]
    fn test_sign_normal_transfered() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSigned::gen(body, id, &mut sk);

        let sign = bson::to_vec(&sign).unwrap();
        let sign = bson::from_slice::<RequestSigned>(&sign).unwrap();

        assert_eq!(sign.verify(&pk), Ok(()));
    }

    #[test]
    fn test_sign_replay() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSigned::gen(body, id, &mut sk);

        assert_eq!(sign.verify(&pk), Ok(()));
        assert_eq!(sign.verify(&pk), Err(VerifyError::RndUsed));
    }

    #[test]
    fn test_sign_fake_sk() {
        let (body, id, _, pk) = prepare_data();

        let mut sk = SigningKey::generate(&mut OsRng);
        let sign = RequestSigned::gen(body, id, &mut sk);

        assert_eq!(sign.verify(&pk), Err(VerifyError::Signature));
    }

    #[test]
    fn test_sign_fake_data() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSigned::gen(body, id, &mut sk);

        let modify = [
            |s: &mut RequestSigned| {
                s.body[0] += 1;
            },
            |s: &mut RequestSigned| {
                s.timestamp = s
                    .timestamp
                    .checked_add_signed(TimeDelta::try_milliseconds(1).unwrap())
                    .expect("shouldn't overflow");
            },
            |s: &mut RequestSigned| {
                s.rnd += 1;
            },
        ];

        for (idx, f) in modify.into_iter().enumerate() {
            let mut sign = sign.clone();
            f(&mut sign);

            assert_eq!(
                sign.verify(&pk),
                Err(VerifyError::Signature),
                "test index: {}",
                idx
            );
        }
    }

    #[test]
    fn test_sign_invalid_timestamp() {
        let (body, id, mut sk, pk) = prepare_data();

        let mut sign = RequestSigned::gen(body, id, &mut sk);
        sign.timestamp = sign
            .timestamp
            .checked_add_signed(TimeDelta::try_minutes(-11).unwrap())
            .expect("shouldn't overflow");

        sign.do_sign(&mut sk);
        assert_eq!(sign.verify(&pk), Err(VerifyError::Timestamp));
    }

    #[cfg(feature = "bench")]
    mod bench {
        extern crate test;
        use std::hint::black_box as bb;

        use super::*;

        #[bench]
        fn bench_sign(b: &mut test::Bencher) {
            let (body, id, mut sk, pk) = prepare_data();
            b.iter(|| {
                let sign = RequestSigned::gen(body.clone(), id.clone(), &mut sk);
                bb(sign);
            })
        }
        #[bench]
        fn bench_raw_sign_empty(b: &mut test::Bencher) {
            let (body, id, mut sk, pk) = prepare_data();
            b.iter(|| {
                let sign = sk.sign(bb(&[]));
                bb(sign);
            })
        }

        #[bench]
        fn bench_verify(b: &mut test::Bencher) {
            let (body, id, mut sk, pk) = prepare_data();

            let sign = bb(RequestSigned::gen(body, id, &mut sk));
            b.iter(|| {
                let _ = bb(&sign.verify(&pk));
            })
        }
    }
}
