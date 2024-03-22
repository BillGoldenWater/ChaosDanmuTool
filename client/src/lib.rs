use std::env::{self};

use anyhow::{anyhow, Context as _};
use ed25519_dalek::{SigningKey, SECRET_KEY_LENGTH};
use rand::rngs::OsRng;
use share::{
    self,
    data_primitives::{auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, public_key::PublicKey},
    utils::{functional::Functional as _, hex},
};
use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

use crate::client::{client_config::ClientConfig, Client};

pub mod client;

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
        return anyhow!("invalid secret key length").into_err();
    }

    SigningKey::from_bytes(&sk.try_into().expect("expect into success")).into_ok()
}

async fn main() {
    let _ = dotenv::dotenv();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .init();

    let client = Client::new(
        ClientConfig::builder()
            .api_base("http://127.0.0.1:25500".into())
            .key_id(AuthKeyId::admin())
            .key(read_admin_sk().expect("expect admin sk exists and valid"))
            .build(),
    )
    .expect("expect build success");

    let pk = SigningKey::generate(&mut OsRng).verifying_key();
    let res = client
        .admin_key_add(
            PublicKey::from_verifying_key(&pk),
            AuthKeyNote::new("test node".into()),
        )
        .await;
    dbg!(&res);

    // tauri::Builder::default()
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
