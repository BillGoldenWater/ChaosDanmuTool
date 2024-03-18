#![warn(missing_debug_implementations)]
#![cfg_attr(feature = "bench", feature(test))]

use std::env;

use anyhow::Context;
use bili_api::client::{config::BiliApiClientConfig, BiliApiClient};
use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

mod bili_api;

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

    let code = env_var("BILI_CODE")?;

    let client = BiliApiClient::new(
        BiliApiClientConfig::builder()
            .api_base("https://live-open.biliapi.com".into())
            .app_id(app_id)
            .access_key_id(access_key_id.into())
            .access_key_secret(access_key_secret.into())
            .build(),
    )?;

    let res = client
        .app_start(serde_json::from_str(&format!("\"{code}\"")).unwrap())
        .await
        .with_context(|| "failed to start")?;
    dbg!(&res);
    let game_id = res.game_info.game_id;
    client
        .app_heartbeat(game_id.clone())
        .await
        .with_context(|| "failed to heartbeat")?;
    let res = client
        .app_heartbeat_batched(vec![game_id.clone()])
        .await
        .with_context(|| "failed to heartbeat batched")?;
    dbg!(&res);
    client
        .app_end(game_id)
        .await
        .with_context(|| "failed to end")?;

    Ok(())
}
