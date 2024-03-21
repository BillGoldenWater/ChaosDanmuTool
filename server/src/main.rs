#![warn(missing_debug_implementations)]
#![cfg_attr(feature = "bench", feature(test))]

use std::env::{self, VarError};

use anyhow::{anyhow, Context};
use bili_api::client::{config::BiliApiClientConfig, BiliApiClient};
use ed25519_dalek::{SigningKey, VerifyingKey, PUBLIC_KEY_LENGTH};
use rand::rngs::OsRng;
use server::{config::ServerConfig, Server};
use share::utils::{
    functional::Functional,
    hex::{from_str, to_string},
};
use tracing::error;
use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

mod bili_api;
mod database;
mod server;

fn main() -> anyhow::Result<()> {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?;
    rt.block_on(run())
}

fn env_var(key: &str) -> anyhow::Result<String> {
    env::var(key).with_context(|| format!("failed to read {key}"))
}

fn read_admin_pk() -> anyhow::Result<VerifyingKey> {
    let pk = match env_var("CDT_ADMIN_PK") {
        Ok(data) => data,
        Err(err) => match err.downcast_ref::<VarError>() {
            Some(VarError::NotPresent) => {
                error!("CDT_ADMIN_PK isn't found in environment variable, generating one");
                let sk = SigningKey::generate(&mut OsRng);
                let pk = sk.verifying_key();
                let sk = to_string(sk.as_bytes());
                let pk = to_string(pk.as_bytes());
                error!("CDT_ADMIN_SK={sk}\nCDT_ADMIN_PK={pk}");
                std::process::exit(0);
            }
            _ => return err.into_err().context("failed to read admin pub key"),
        },
    };

    let pk = from_str(&pk).context("failed to decode pub key from hex")?;

    if pk.len() != PUBLIC_KEY_LENGTH {
        return anyhow!("invalid pub key length").into_err();
    }

    VerifyingKey::from_bytes(&pk.try_into().expect("expect into success"))
        .context("invalid pub key")
}

async fn run() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .init();

    let app_id = env_var("BILI_APP_ID")?.parse::<i64>().unwrap();
    let access_key_id = env_var("BILI_ACCESS_KEY_ID")?;
    let access_key_secret = env_var("BILI_ACCESS_KEY_SECRET")?;

    let admin_pk = read_admin_pk()?;

    let client = BiliApiClient::new(
        BiliApiClientConfig::builder()
            .api_base("https://live-open.biliapi.com".into())
            .app_id(app_id)
            .access_key_id(access_key_id.into())
            .access_key_secret(access_key_secret.into())
            .build(),
    )?;

    let server = Server::new(
        ServerConfig::builder()
            .host("0.0.0.0:25500".into())
            .admin_pub_key(admin_pk)
            .build(),
        client,
    );

    server.run().await.context("failed to run server")?;

    Ok(())
}
