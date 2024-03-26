use anyhow::Context;
use ed25519_dalek::SigningKey;
use rand::rngs::OsRng;
use share::data_primitives::{auth_key_note::AuthKeyNote, public_key::PublicKey};
use tauri::Manager;

use crate::{
    api_client::{api_client_config::ApiClientConfig, ApiClient},
    secret_key,
};

pub mod init;

pub async fn main() -> anyhow::Result<()> {
    init::init();

    let app = tauri::Builder::default()
        .build(tauri::generate_context!())
        .context("failed to build tauri app")?;

    let path_resolver = app.path();
    let data_dir = path_resolver
        .app_data_dir()
        .context("failed to get data dir")?;
    let _config_dir = path_resolver
        .app_config_dir()
        .context("failed to get config dir")?;

    let (key_id, key) = secret_key::read_or_gen(&data_dir).context("failed to read key")?;

    let client = ApiClient::new(
        ApiClientConfig::builder()
            .api_base("http://127.0.0.1:25500".into())
            .key_id(key_id)
            .key(key)
            .build(),
    )
    .context("failed to build api client")?;

    dbg!(&client.status_version().await);

    let pk = SigningKey::generate(&mut OsRng).verifying_key();
    let res = client
        .admin_key_add(
            PublicKey::from_verifying_key(&pk),
            AuthKeyNote::new("test node".into()),
        )
        .await;
    dbg!(&res);

    // app.run(|_app_handle, event| match event {
    //     _ => {}
    // });

    Ok(())
}
