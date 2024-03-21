use std::sync::Arc;

use anyhow::Context;
use axum::{extract::State, response::IntoResponse, routing::post, Router};
use ed25519_dalek::VerifyingKey;
use share::{
    data_primitives::auth_key_id::AuthKeyId,
    server_api::{
        admin::key_add::{ReqKeyAdd, ResKeyAdd},
        Request as _, Response,
    },
};
use tracing::{info, instrument};

use self::{config::ServerConfig, signed_body::SignedBody};
use crate::bili_api::client::BiliApiClient;

pub mod config;
pub mod signed_body;

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

    #[instrument(level = "trace", skip(self))]
    pub fn get_pub_key(&self, key_id: &AuthKeyId) -> Option<&VerifyingKey> {
        if key_id.is_admin_key() {
            return Some(&self.inner.cfg.admin_pub_key);
        }

        // TODO: key storage
        todo!()
    }

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
}
