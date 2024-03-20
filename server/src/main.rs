#![warn(missing_debug_implementations)]
#![cfg_attr(feature = "bench", feature(test))]

use std::{env, time::Duration};

use anyhow::Context;
use bili_api::client::{config::BiliApiClientConfig, BiliApiClient};
use server::{config::ServerConfig, Server};
use tokio::time::sleep;
use tracing::debug;
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

pub fn env_var(key: &str) -> anyhow::Result<String> {
    env::var(key).with_context(|| format!("failed to read {key}"))
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

    let client = BiliApiClient::new(
        BiliApiClientConfig::builder()
            .api_base("https://live-open.biliapi.com".into())
            .app_id(app_id)
            .access_key_id(access_key_id.into())
            .access_key_secret(access_key_secret.into())
            .build(),
    )?;

    let server = Server::new(
        ServerConfig::builder().host("0.0.0.0:25500".into()).build(),
        client,
    );

    tokio::spawn(async {
        sleep(Duration::from_secs_f64(0.1)).await;
        let res = reqwest::Client::new()
            .post("http://127.0.0.1:25500/v0/admin/keyGen")
            .send()
            .await
            .unwrap()
            .bytes()
            .await;
        debug!("{res:?}");
    });

    server.run().await.context("failed to run server")?;

    Ok(())
}
