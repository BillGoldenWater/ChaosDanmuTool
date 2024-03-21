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

pub const SIGNATURE_HEADER_NAME: &str = "x-cdt-signature";

define_data_type!(
    struct RequestSignature {
        #[serde(with = "serde_bytes")]
        md5: [u8; 16],
        #[serde(with = "chrono_datetime_as_bson_datetime")]
        timestamp: DateTime<Utc>,
        rnd: i64,
        key_id: AuthKeyId,
        sign: Box<AuthSignature>,
    }
);

impl RequestSignature {
    pub fn gen(body: &[u8], key_id: AuthKeyId, key: &mut SigningKey) -> RequestSignature {
        let mut result = Self {
            md5: hash_md5(body).into(),
            timestamp: Utc::now(),
            rnd: OsRng.gen(),
            key_id,
            sign: AuthSignature::zero().into(),
        };

        result.do_sign(key);

        result
    }

    fn do_sign(&mut self, key: &mut SigningKey) {
        self.sign = AuthSignature::from_signature(&key.sign(&self.to_msg())).into();
    }

    pub fn key_id(&self) -> &AuthKeyId {
        &self.key_id
    }

    pub fn verify(&self, body: &[u8], key: &VerifyingKey) -> Result<(), VerifyError> {
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

        let body_hash: [u8; 16] = hash_md5(body).into();
        if body_hash != self.md5 {
            return VerifyError::Hash.into_err();
        }

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
        self.md5
            .into_iter()
            .chain(self.timestamp.timestamp().to_le_bytes())
            // NOTE: bson::DateTime only has millisecond precision
            .chain(self.timestamp.timestamp_subsec_millis().to_le_bytes())
            .chain(self.rnd.to_le_bytes())
            .collect()
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
        #[error("invalid hash")]
        Hash,
    }
);

#[cfg(test)]
mod tests {
    use chrono::TimeDelta;

    use super::*;

    fn prepare_data() -> (Vec<u8>, AuthKeyId, SigningKey, VerifyingKey) {
        let sk = SigningKey::generate(&mut OsRng);
        let pk = sk.verifying_key();
        (vec![1, 2, 3, 4, 5, 6, 7, 8], AuthKeyId::new(), sk, pk)
    }

    #[test]
    fn test_sign_normal() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSignature::gen(&body, id, &mut sk);

        assert_eq!(sign.verify(&body, &pk), Ok(()));
    }

    #[test]
    fn test_sign_normal_transfered() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSignature::gen(&body, id, &mut sk);

        let sign = bson::to_vec(&sign).unwrap();
        let sign = bson::from_slice::<RequestSignature>(&sign).unwrap();

        assert_eq!(sign.verify(&body, &pk), Ok(()));
    }

    #[test]
    fn test_sign_replay() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSignature::gen(&body, id, &mut sk);

        assert_eq!(sign.verify(&body, &pk), Ok(()));
        assert_eq!(sign.verify(&body, &pk), Err(VerifyError::RndUsed));
    }

    #[test]
    fn test_sign_fake_body() {
        let (mut body, id, mut sk, pk) = prepare_data();

        let sign = RequestSignature::gen(&body, id, &mut sk);
        body[0] += 1;

        assert_eq!(sign.verify(&body, &pk), Err(VerifyError::Hash));
    }

    #[test]
    fn test_sign_fake_sk() {
        let (body, id, _, pk) = prepare_data();

        let mut sk = SigningKey::generate(&mut OsRng);
        let sign = RequestSignature::gen(&body, id, &mut sk);

        assert_eq!(sign.verify(&body, &pk), Err(VerifyError::Signature));
    }

    #[test]
    fn test_sign_fake_metadata() {
        let (body, id, mut sk, pk) = prepare_data();

        let sign = RequestSignature::gen(&body, id, &mut sk);

        let modify = [
            |s: &mut RequestSignature| {
                s.md5[0] += 1;
            },
            |s: &mut RequestSignature| {
                s.timestamp = s
                    .timestamp
                    .checked_add_signed(TimeDelta::try_milliseconds(1).unwrap())
                    .expect("shouldn't overflow");
            },
            |s: &mut RequestSignature| {
                s.rnd += 1;
            },
        ];

        for (idx, f) in modify.into_iter().enumerate() {
            let mut sign = sign.clone();
            f(&mut sign);

            assert_eq!(
                sign.verify(&body, &pk),
                Err(VerifyError::Signature),
                "test index: {}",
                idx
            );
        }
    }

    #[test]
    fn test_sign_invalid_timestamp() {
        let (body, id, mut sk, pk) = prepare_data();

        let mut sign = RequestSignature::gen(&body, id, &mut sk);
        sign.timestamp = sign
            .timestamp
            .checked_add_signed(TimeDelta::try_minutes(-11).unwrap())
            .expect("shouldn't overflow");

        sign.do_sign(&mut sk);
        assert_eq!(sign.verify(&body, &pk), Err(VerifyError::Timestamp));
    }
}
