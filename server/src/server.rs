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
    server_api::{
        admin::key_register::ReqKeyRegister, danmu::start::ReqStart, status::version::ReqVersion,
        Request as _,
    },
    utils::{axum::compression_layer, functional::Functional},
};
use tokio::signal;
use tower::ServiceBuilder;
use tower_http::trace::{DefaultOnResponse, TraceLayer};
use tracing::{debug, info, instrument, Level, Span};

use self::{
    config::ServerConfig,
    handler::{
        admin_key_register::admin_key_register, danmu_start::danmu_start,
        status_version::status_version,
    },
};
use crate::{
    bili_api::{
        client::BiliApiClient,
        response_error::{ret_code::RetCode, ResponseError as BiliResErr},
    },
    database::{
        data_model::{auth_key_info::AuthKeyInfo, session_info::SessionInfo},
        Database,
    },
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
            .route(ReqStart::ROUTE, post(danmu_start))
            .layer(compression_layer())
            .layer(
                ServiceBuilder::new().layer(
                    TraceLayer::new_for_http()
                        .on_request(|req: &http::Request<axum::body::Body>, _: &Span| {
                            let ip =
                                match req.headers().get("cf-connecting-ip").map(|it| it.to_str()) {
                                    Some(Ok(ip)) => ip,
                                    _ => "unknown",
                                };

                            debug!(
                                cmd = "on_req",
                                "on request [{}] {}: {}",
                                ip,
                                req.method(),
                                req.uri().path()
                            );
                        })
                        .on_response(DefaultOnResponse::new().level(Level::DEBUG)),
                ),
            )
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
    fn db(&self) -> &Database {
        &self.inner.db
    }

    fn bili(&self) -> &BiliApiClient {
        &self.inner.bili
    }

    #[instrument(level = "trace", skip(self))]
    async fn get_pub_key(&self, key_id: &AuthKeyId) -> anyhow::Result<Option<VerifyingKey>> {
        debug!("getting public key of {}", key_id);

        if key_id.is_admin_key() {
            return self.inner.cfg.admin_pub_key.some().into_ok();
        }

        let coll = self.inner.db.coll::<AuthKeyInfo>();

        let id = key_id.to_bson()?;
        let key = coll
            .find_one(doc! {"id": id}, None)
            .await
            .context("failed to find the key")?;

        if let Some(key) = key {
            key.public_key
                .to_verifying_key()
                .context("failed to parse the key")?
                .some()
        } else {
            None
        }
        .into_ok()
    }

    #[instrument(level = "trace", skip(self))]
    async fn session_end(&self, session_info: SessionInfo) -> anyhow::Result<()> {
        debug!("ending session of {}", session_info.key_id);

        let id = session_info.key_id.to_bson_raw_err()?;

        self.db()
            .coll::<SessionInfo>()
            .delete_one(doc! {"key_id": id}, None)
            .await?;

        let result = self.bili().app_end(session_info.game_id.clone()).await;
        if let Err(err) = result {
            if !matches!(
                err.downcast_ref::<BiliResErr>(),
                Some(BiliResErr {
                    code: RetCode::InvalidGameId,
                    ..
                })
            ) {
                return Err(err);
            }
        }

        Ok(())
    }
}

#[derive(Debug)]
struct ServerInner {
    pub cfg: ServerConfig,
    pub bili: BiliApiClient,
    pub db: Database,
}
