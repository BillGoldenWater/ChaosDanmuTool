use std::sync::Arc;

use anyhow::Context;
use reqwest::ClientBuilder;
use semver::Version;
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
        status::version::ReqVersion,
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

// initialization
impl ApiClient {
    #[instrument(level = "debug")]
    pub fn new(config: ApiClientConfig) -> anyhow::Result<Self> {
        Self {
            inner: ApiClientRef::new(config)?.into(),
        }
        .into_ok()
    }
}

// status
impl ApiClient {
    #[instrument(level = "debug", skip(self))]
    pub async fn status_version(&self) -> anyhow::Result<Version> {
        type Req = ReqVersion;

        self.inner
            .client
            .get(self.inner.req_url::<Req>())
            .send()
            .await
            .context("failed to send request")?
            .then(|res| ApiClientRef::parse_res::<Req>(res))
            .await
            .context("failed to parse response")?
            .minimum_version
            .then(TryInto::try_into)
            .context("failed to parse version")
    }
}

// admin
impl ApiClient {
    #[instrument(level = "debug", skip(self))]
    pub async fn admin_key_add(
        &self,
        public_key: PublicKey,
        note: AuthKeyNote,
    ) -> anyhow::Result<ResKeyAdd> {
        self.inner.send(&ReqKeyAdd { public_key, note }).await
    }
}

// danmu
impl ApiClient {
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
                .context("failed to build reqwest::Client")?,
            cfg: config,
        }
        .into_ok()
    }

    pub async fn send<Req: Request>(&self, param: &Req) -> anyhow::Result<Req::Response> {
        let body = bson::to_vec(param).context("failed to serialize param")?;
        let req_signed =
            RequestSigned::gen(body, self.cfg.key_id.clone(), &mut self.cfg.key.clone())
                .then_ref(bson::to_vec)
                .context("failed to serialize signature")?;

        let res = self
            .client
            .post(self.req_url::<Req>())
            .body(req_signed)
            .send()
            .await
            .context("failed to send request")?;

        Self::parse_res::<Req>(res).await
    }

    pub fn req_url<Req: Request>(&self) -> String {
        format!("{}{}", self.cfg.api_base, Req::ROUTE)
    }

    pub async fn parse_res<Req: Request>(res: reqwest::Response) -> anyhow::Result<Req::Response> {
        let res = res.bytes().await.context("failed to read response body")?;

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
