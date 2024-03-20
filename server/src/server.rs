use std::sync::Arc;

use anyhow::Context;
use axum::{
    extract::State,
    response::{IntoResponse, Response},
    routing::post,
    Router,
};
use ed25519_dalek::SigningKey;
use http::header::CONTENT_TYPE;
use rand::rngs::OsRng;
use tracing::{info, instrument};

use self::{
    api::{
        admin::key_gen::{ReqKeyGen, ResKeyGen},
        Request,
    },
    config::ServerConfig,
};
use crate::{
    bili_api::client::BiliApiClient,
    database::data_model::data_primitives::{auth_key_id::AuthKeyId, secret_key::SecretKey},
};

pub mod api;
pub mod config;

#[derive(Debug, Clone)]
pub struct Server {
    inner: Arc<ServerInner>,
}

impl Server {
    pub fn new(config: ServerConfig, bili_api_client: BiliApiClient) -> Self {
        Self {
            inner: ServerInner {
                cfg: config,
                bili: bili_api_client,
            }
            .into(),
        }
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn run(&self) -> anyhow::Result<()> {
        let router = Router::new()
            .route(ReqKeyGen::ROUTE, post(Self::admin_key_gen))
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

    #[instrument(level = "debug", skip(s))]
    async fn admin_key_gen(State(s): State<Server>) -> impl IntoResponse {
        bson::to_vec(&ResKeyGen {
            key_id: AuthKeyId::new(),
            secret_key: SecretKey::from_signing_key(SigningKey::generate(&mut OsRng)),
        })
        .unwrap()
        .into_response()
    }
}

#[derive(Debug)]
struct ServerInner {
    pub cfg: ServerConfig,
    pub bili: BiliApiClient,
}
