#![warn(missing_debug_implementations)]
#![cfg_attr(feature = "bench", feature(test))]

use std::env;

use anyhow::Context;

use crate::bili_api::utils::signature::request_sign_header_gen;

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
    tracing_subscriber::fmt::init();

    let _app_id = env_var("BILI_APP_ID")?;
    let access_key_id = env_var("BILI_ACCESS_KEY_ID")?;
    let access_key_secret = env_var("BILI_ACCESS_KEY_SECRET")?;

    let headers = request_sign_header_gen(&access_key_id, &access_key_secret, "{}")?;
    dbg!(headers);

    Ok(())
}
