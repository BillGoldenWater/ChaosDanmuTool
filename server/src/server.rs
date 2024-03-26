use std::sync::Arc;

use anyhow::Context;
use axum::{
    extract::State,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use bson::doc;
use ed25519_dalek::VerifyingKey;
use share::{
    data_primitives::{auth_key_id::AuthKeyId, version::Version, DataPrimitive as _},
    server_api::{
        admin::key_add::{ReqKeyAdd, ResKeyAdd},
        status::version::{ReqVersion, ResVersion},
        Request as _, Response,
    },
    utils::functional::Functional,
};
use tracing::{info, instrument};

use self::{config::ServerConfig, signed_body::SignedBody};
use crate::{
    bili_api::client::BiliApiClient,
    database::{data_model::auth_key_info::AuthKeyInfo, Database},
};

pub mod config;
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
            .route(ReqVersion::ROUTE, get(Self::status_version))
            .route(ReqKeyAdd::ROUTE, post(Self::admin_key_add))
            .with_state(self.clone());

        let listener = tokio::net::TcpListener::bind(self.inner.cfg.host.as_ref())
            .await
            .context("falied to listen")?;

        info!("starting on {}", self.inner.cfg.host);
        axum::serve(listener, router)
            .await
            .context("failed to axum::serve")?;

        Ok(())
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

// status
impl Server {
    #[instrument(level = "debug", skip(s))]
    async fn status_version(State(s): State<Server>) -> impl IntoResponse {
        Response::Ok(ResVersion {
            minimum_version: s.inner.cfg.min_client_ver.clone().into(),
        })
    }
}

// admin
impl Server {
    #[instrument(level = "debug", skip(_s, body))]
    async fn admin_key_add(
        State(_s): State<Server>,
        SignedBody { body, is_admin }: SignedBody<ReqKeyAdd>,
    ) -> impl IntoResponse {
        dbg!(&body.note);
        dbg!(&is_admin);
        Response::Ok(ResKeyAdd {
            key_id: AuthKeyId::new(),
        })
    }
}

#[derive(Debug)]
struct ServerInner {
    pub cfg: ServerConfig,
    pub bili: BiliApiClient,
    pub db: Database,
}
