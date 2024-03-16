use anyhow::Context;
use hmac::{Hmac, Mac};
use http::{HeaderMap, HeaderName, HeaderValue};
use itertools::Itertools;
use md5::{Digest, Md5};
use sha2::Sha256;

pub fn request_sign_header_gen(
    access_key_id: &str,
    access_key_secret: &str,
    body: &str,
) -> anyhow::Result<HeaderMap> {
    // body md5
    let body_md5 = {
        let mut hasher = Md5::new();
        hasher.update(body);
        let hash = hasher.finalize();

        let mut hash_buf = vec![0_u8; 128 / 8 * 2];
        base16ct::lower::encode(&hash, &mut hash_buf).expect("dst length correct");
        String::from_utf8(hash_buf).expect("hex should be valid utf8")
    };

    // nonce
    let (nonce, ts) = {
        let rnd: u64 = rand::random();
        let ts = chrono::Utc::now().timestamp();

        (format!("{rnd}-{ts}"), ts)
    };

    let (mut headers, signature) =
        sign_inner(access_key_id, access_key_secret, body_md5, nonce, ts)?;

    header_insert(&mut headers, "authorization", signature)?;

    Ok(headers)
}

fn sign_inner(
    access_key_id: &str,
    access_key_secret: &str,
    body_md5: String,
    nonce: String,
    ts: i64,
) -> anyhow::Result<(HeaderMap, String)> {
    let mut headers = HeaderMap::with_capacity(9);

    header_insert(&mut headers, "x-bili-accesskeyid", access_key_id.into())?;
    header_insert(&mut headers, "x-bili-content-md5", body_md5)?;
    header_insert(
        &mut headers,
        "x-bili-signature-method",
        "HMAC-SHA256".into(),
    )?;
    header_insert(&mut headers, "x-bili-signature-nonce", nonce)?;
    header_insert(&mut headers, "x-bili-signature-version", "1.0".into())?;
    header_insert(&mut headers, "x-bili-timestamp", ts.to_string())?;

    // signature
    let signature = {
        let header_for_sign = headers
            .iter()
            .sorted_by_key(|(k, _)| k.as_str())
            .map(|(k, v)| {
                format!(
                    "{}:{}",
                    k.as_str(),
                    std::str::from_utf8(v.as_bytes()).expect("valid utf8")
                )
            })
            .join("\n");

        let mut hmac = Hmac::<Sha256>::new_from_slice(access_key_secret.as_bytes())
            .expect("HMAC shouldn't throw a error");
        hmac.update(header_for_sign.trim_end().as_bytes());
        let sign = hmac.finalize().into_bytes();

        let mut sign_buf = vec![0_u8; 256 / 8 * 2];
        base16ct::lower::encode(&sign, &mut sign_buf).expect("dst length correct");
        String::from_utf8(sign_buf).expect("hex should be valid utf8")
    };

    Ok((headers, signature))
}

fn header_insert(headers: &mut HeaderMap, k: &'static str, v: String) -> anyhow::Result<()> {
    headers.insert(
        HeaderName::from_static(k),
        HeaderValue::from_maybe_shared(bytes::Bytes::from(v))
            .with_context(|| format!("failed to create {k}"))?,
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(feature = "bench")]
    extern crate test;

    #[test]
    fn test_sign() {
        // the sercet isn't real
        let (_, sign) = sign_inner(
            "xxxx",
            "JzOzZfSHeYYnAMZ",
            "fa6837e35b2f591865b288dfd859ce9d".into(),
            "ad184c09-095f-91c3-0849-230dd3744045".into(),
            1624594467,
        )
        .unwrap();

        assert_eq!(
            sign,
            "a81c50234b6bbf15bc56e387ee4f19c6f871af2f70b837dc56db16517d4a341f"
        );
    }

    #[cfg(feature = "bench")]
    #[bench]
    fn bench_sign(b: &mut test::Bencher) {
        b.iter(|| {
            let _ = std::hint::black_box(request_sign_header_gen(
                std::hint::black_box("xxxx"),
                std::hint::black_box("JzOzZfSHeYYnAMZ"),
                std::hint::black_box(r#"{}"#),
            ));
        })
    }
}
