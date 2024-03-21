use std::env::{self};

use anyhow::{anyhow, Context as _};
use bson::Bson;
use ed25519_dalek::{SigningKey, SECRET_KEY_LENGTH};
use rand::rngs::OsRng;
use share::{
    data_primitives::{auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, public_key::PublicKey},
    server_api::{
        admin::key_add::ReqKeyAdd,
        request_signature::{RequestSignature, SIGNATURE_HEADER_NAME},
        Request,
    },
    utils::{functional::Functional as _, hex},
};
use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("failed to build async runtime");

    tauri::async_runtime::set(rt.handle().clone());
    rt.block_on(main());
}

fn env_var(key: &str) -> anyhow::Result<String> {
    env::var(key).with_context(|| format!("failed to read {key}"))
}

fn read_admin_sk() -> anyhow::Result<SigningKey> {
    let sk = env_var("CDT_ADMIN_SK")?;

    let sk = hex::from_str(&sk).context("failed to decode secret key from hex")?;

    if sk.len() != SECRET_KEY_LENGTH {
        return anyhow!("invalid pub key length").into_err();
    }

    SigningKey::from_bytes(&sk.try_into().expect("into success")).into_ok()
}

async fn main() {
    let _ = dotenv::dotenv();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .init();

    let pk = SigningKey::generate(&mut OsRng).verifying_key();

    let body = ReqKeyAdd {
        public_key: PublicKey::from_verifying_key(&pk),
        note: AuthKeyNote::new("test node".into()),
    };

    let body = bson::to_vec(&body).expect("expect serialize success");

    let key_id = AuthKeyId::admin();
    let mut key = read_admin_sk().expect("expect admin sk exists and valid");
    let signature = RequestSignature::gen(&body, key_id, &mut key);
    dbg!(&signature);
    let sign = bson::to_vec(&signature).expect("expect serialize success");
    let sign = hex::to_string(&sign);
    dbg!(&sign);

    let client = reqwest::Client::new();
    let res = client
        .post(format!("http://127.0.0.1:25500{}", ReqKeyAdd::ROUTE))
        .header(SIGNATURE_HEADER_NAME, sign)
        .body(body)
        .send()
        .await
        .expect("expect no issue sending request")
        .bytes()
        .await
        .expect("expect no issue reading response");
    let res = bson::from_slice::<Bson>(&res);
    dbg!(&res);

    // tauri::Builder::default()
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
