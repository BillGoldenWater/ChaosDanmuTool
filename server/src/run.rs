use anyhow::Context;
use semver::{BuildMetadata, Prerelease, Version};
use share::utils::{env, functional::Functional};

use crate::{
    bili_api::client::{config::BiliApiClientConfig, BiliApiClient},
    database::Database,
    key::read_admin_pk,
    server::{config::ServerConfig, Server},
};

pub mod init;

pub async fn run() -> anyhow::Result<()> {
    init::init();

    let app_id = env::read("BILI_APP_ID")?
        .parse::<i64>()
        .context("failed to parse app id")?;
    let access_key_id = env::read("BILI_ACCESS_KEY_ID")?;
    let access_key_secret = env::read("BILI_ACCESS_KEY_SECRET")?;

    let db_uri = env::read("CDT_MONGO_URI")?;
    let db_name = env::read("CDT_MONGO_NAME")?;

    let admin_pk = read_admin_pk()?;

    let client = BiliApiClient::new(
        BiliApiClientConfig::builder()
            .api_base("https://live-open.biliapi.com".into())
            .app_id(app_id)
            .access_key_id(access_key_id.into())
            .access_key_secret(access_key_secret.into())
            .build(),
    )?;

    let database = Database::new(&db_uri, &db_name)
        .await
        .context("failed to open database")?;

    // TODO: run under cli arg
    database
        .init()
        .await
        .context("failed to initialize database")?;

    // TODO: version check endpoint instead of version in path
    // TODO: guest access
    // TODO: axum/reqwest body compression
    let server = Server::new(
        ServerConfig::builder()
            .host("0.0.0.0:25500".into())
            .admin_pub_key(admin_pk)
            .min_client_ver(Version {
                major: 0,
                minor: 10,
                patch: 0,
                pre: Prerelease::EMPTY,
                build: BuildMetadata::EMPTY,
            })
            .build(),
        client,
        database,
    );

    server.run().await.context("failed to run server")?;

    Ok(())
}
