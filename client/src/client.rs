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
        request_signature::{RequestSignature, SIGNATURE_HEADER_NAME},
        Request, Response,
    },
    utils::{functional::Functional, hex},
};
use tracing::instrument;

use self::client_config::ClientConfig;

pub mod client_config;

#[derive(Debug, Clone)]
pub struct Client {
    inner: Arc<ClientRef>,
}

impl Client {
    #[instrument(level = "debug")]
    pub fn new(config: ClientConfig) -> anyhow::Result<Self> {
        Self {
            inner: ClientRef::new(config)?.into(),
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
struct ClientRef {
    client: reqwest::Client,
    cfg: ClientConfig,
}

impl ClientRef {
    pub fn new(config: ClientConfig) -> anyhow::Result<Self> {
        Self {
            client: ClientBuilder::new()
                .build()
                .with_context(|| "failed to build reqwest::Client")?,
            cfg: config,
        }
        .into_ok()
    }

    pub async fn send<Req: Request>(&self, param: &Req) -> anyhow::Result<Req::Response> {
        let body = bson::to_vec(param).with_context(|| "failed to serialize param")?;

        let mut key = self.cfg.key.clone();
        let signature = RequestSignature::gen(&body, self.cfg.key_id.clone(), &mut key);
        let signature =
            bson::to_vec(&signature).with_context(|| "failed to serialize signature")?;

        let res = self
            .client
            .post(format!(
                "{base}{route}",
                base = self.cfg.api_base,
                route = Req::ROUTE
            ))
            .header(SIGNATURE_HEADER_NAME, hex::to_string(&signature))
            .body(body)
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
