use std::sync::Arc;

use anyhow::Context;
use axum::{
    routing::{get, post},
    Router,
};
use bson::doc;
use ed25519_dalek::VerifyingKey;
use share::{
    data_primitives::{auth_key_id::AuthKeyId, DataPrimitive},
    server_api::{admin::key_register::ReqKeyRegister, status::version::ReqVersion, Request as _},
    utils::{axum::compression_layer, functional::Functional},
};
use tokio::signal;
use tracing::{info, instrument};

use self::{
    config::ServerConfig,
    handler::{admin_key_register::admin_key_register, status_version::status_version},
};
use crate::{
    bili_api::client::BiliApiClient,
    database::{data_model::auth_key_info::AuthKeyInfo, Database},
};

pub mod config;
pub mod handler;
pub mod signed_body;

#[derive(Debug, Clone)]
pub struct Server {
    inner: Arc<ServerInner>,
}

// startup logic
impl Server {
    pub fn new(config: ServerConfig, bili_api_client: BiliApiClient, database: Database) -> Self {
        Self {
            inner: ServerInner {
                cfg: config,
                bili: bili_api_client,
                db: database,
            }
            .into(),
        }
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn run(&self) -> anyhow::Result<()> {
        let router = Router::new()
            .route(ReqVersion::ROUTE, get(status_version))
            .route(ReqKeyRegister::ROUTE, post(admin_key_register))
            .layer(compression_layer())
            .with_state(self.clone());

        let listener = tokio::net::TcpListener::bind(self.inner.cfg.host.as_ref())
            .await
            .context("falied to listen")?;

        info!("starting on {}", self.inner.cfg.host);
        axum::serve(listener, router)
            .with_graceful_shutdown(Self::shutdown_signal())
            .await
            .context("failed to axum::serve")?;

        Ok(())
    }

    async fn shutdown_signal() {
        let ctrl_c = async {
            signal::ctrl_c()
                .await
                .expect("failed to install Ctrl+C handler");
        };

        #[cfg(unix)]
        let terminate = async {
            signal::unix::signal(signal::unix::SignalKind::terminate())
                .expect("failed to install signal handler")
                .recv()
                .await;
        };

        #[cfg(not(unix))]
        let terminate = std::future::pending::<()>();

        tokio::select! {
            _ = ctrl_c => {},
            _ = terminate => {},
        }
    }
}

// internal api
impl Server {
    #[instrument(level = "trace", skip(self))]
    async fn get_pub_key(&self, key_id: &AuthKeyId) -> anyhow::Result<Option<VerifyingKey>> {
        if key_id.is_admin_key() {
            return self.inner.cfg.admin_pub_key.some().into_ok();
        }

        let coll = self.inner.db.coll::<AuthKeyInfo>();

        let id = key_id.to_bson()?;
        let key = coll.find_one(doc! {"id": id}, None).await?;

        if let Some(key) = key {
            return key.public_key.to_verifying_key().map(Some).err_into();
        }

        Ok(None)
    }
}

#[derive(Debug)]
struct ServerInner {
    pub cfg: ServerConfig,
    pub bili: BiliApiClient,
    pub db: Database,
}
