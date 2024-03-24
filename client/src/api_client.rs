use std::sync::Arc;

use anyhow::Context;
use reqwest::ClientBuilder;
use share::{
    data_primitives::{auth_code::AuthCode, auth_key_note::AuthKeyNote, public_key::PublicKey},
    server_api::{
        admin::key_add::{ReqKeyAdd, ResKeyAdd},
        danmu::{
            end::{ReqEnd, ResEnd},
            heartbeat::{ReqHeartbeat, ResHeartbeat},
            start::{ReqStart, ResStart},
        },
        request_signed::RequestSigned,
        Request, Response,
    },
    utils::{functional::Functional, hex},
};
use tracing::instrument;

use self::api_client_config::ApiClientConfig;

pub mod api_client_config;

#[derive(Debug, Clone)]
pub struct ApiClient {
    inner: Arc<ApiClientRef>,
}

impl ApiClient {
    #[instrument(level = "debug")]
    pub fn new(config: ApiClientConfig) -> anyhow::Result<Self> {
        Self {
            inner: ApiClientRef::new(config)?.into(),
        }
        .into_ok()
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn admin_key_add(
        &self,
        public_key: PublicKey,
        note: AuthKeyNote,
    ) -> anyhow::Result<ResKeyAdd> {
        self.inner.send(&ReqKeyAdd { public_key, note }).await
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn danmu_start(&self, code: AuthCode, force: bool) -> anyhow::Result<ResStart> {
        self.inner.send(&ReqStart { code, force }).await
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn danmu_heartbeat(&self) -> anyhow::Result<ResHeartbeat> {
        self.inner.send(&ReqHeartbeat {}).await
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn danmu_end(&self) -> anyhow::Result<ResEnd> {
        self.inner.send(&ReqEnd {}).await
    }
}

#[derive(Debug)]
struct ApiClientRef {
    client: reqwest::Client,
    cfg: ApiClientConfig,
}

impl ApiClientRef {
    pub fn new(config: ApiClientConfig) -> anyhow::Result<Self> {
        Self {
            client: ClientBuilder::new()
                .build()
                .with_context(|| "failed to build reqwest::Client")?,
            cfg: config,
        }
        .into_ok()
    }

    pub async fn send<Req: Request>(&self, param: &Req) -> anyhow::Result<Req::Response> {
        let url = format!("{}{}", self.cfg.api_base, Req::ROUTE);
        let body = bson::to_vec(param).with_context(|| "failed to serialize param")?;
        let req_signed =
            RequestSigned::gen(body, self.cfg.key_id.clone(), &mut self.cfg.key.clone())
                .then_ref(bson::to_vec)
                .with_context(|| "failed to serialize signature")?;

        let res = self
            .client
            .post(url)
            .body(req_signed)
            .send()
            .await
            .with_context(|| "failed to send request")?
            .bytes()
            .await
            .with_context(|| "failed to read response body")?;

        let res: Response<Req::Response> = bson::from_slice(&res).with_context(|| {
            format!(
                "failed to parse response body, body: {}",
                hex::to_string(&res)
            )
        })?;

        match res {
            Response::Ok(res) => res.into_ok(),
            Response::Err(err) => err.into_err(),
        }
        .map_err(Into::into)
    }
}
