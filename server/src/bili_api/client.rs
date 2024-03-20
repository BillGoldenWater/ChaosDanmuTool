use std::sync::Arc;

use anyhow::Context;
use reqwest::{Client, ClientBuilder};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use share::{
    data_primitives::{auth_code::AuthCode, game_id::GameId},
    utils::{functional::Functional, hex::to_string_hex},
};
use tracing::instrument;

use self::{
    api_app_batch_heartbeat::{ReqAppBatchHeartbeat, ResAppBatchHeartbeat},
    api_app_end::{ReqAppEnd, ResAppEnd},
    api_app_heartbeat::{ReqAppHeartbeat, ResAppHeartbeat},
    api_app_start::{ReqAppStart, ResAppStart},
    config::BiliApiClientConfig,
};
use crate::bili_api::{response_error::ResponseError, utils::signature::request_sign_header_gen};

pub mod api_app_batch_heartbeat;
pub mod api_app_end;
pub mod api_app_heartbeat;
pub mod api_app_start;
pub mod config;

#[derive(Debug)]
pub struct BiliApiClient {
    inner: Arc<BiliApiClientRef>,
}

impl BiliApiClient {
    #[instrument(level = "debug")]
    pub fn new(config: BiliApiClientConfig) -> anyhow::Result<Self> {
        Ok(Self {
            inner: BiliApiClientRef::new(config)?.into(),
        })
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_start(&self, code: AuthCode) -> anyhow::Result<ResAppStart> {
        self.inner
            .send(
                "/v2/app/start",
                &ReqAppStart {
                    app_id: self.app_id(),
                    code,
                },
            )
            .await
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_end(&self, game_id: GameId) -> anyhow::Result<()> {
        self.inner
            .send::<_, ResAppEnd>(
                "/v2/app/end",
                &ReqAppEnd {
                    app_id: self.app_id(),
                    game_id,
                },
            )
            .await
            .unit_result()
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_heartbeat(&self, game_id: GameId) -> anyhow::Result<()> {
        self.inner
            .send::<_, ResAppHeartbeat>("/v2/app/heartbeat", &ReqAppHeartbeat { game_id })
            .await
            .unit_result()
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_heartbeat_batched(
        &self,
        game_ids: Vec<GameId>,
    ) -> anyhow::Result<ResAppBatchHeartbeat> {
        self.inner
            .send("/v2/app/batchHeartbeat", &ReqAppBatchHeartbeat { game_ids })
            .await
    }

    fn app_id(&self) -> i64 {
        self.inner.cfg.app_id
    }
}

#[derive(Debug)]
struct BiliApiClientRef {
    client: Client,
    cfg: BiliApiClientConfig,
}

impl BiliApiClientRef {
    pub fn new(config: BiliApiClientConfig) -> anyhow::Result<Self> {
        Ok(Self {
            client: ClientBuilder::new()
                .build()
                .with_context(|| "failed to build reqwest::Client")?,
            cfg: config,
        })
    }

    pub async fn send<P, R>(&self, endpoint: &str, param: &P) -> anyhow::Result<R>
    where
        P: Serialize + ?Sized,
        R: DeserializeOwned,
    {
        let body = serde_json::to_string(param).with_context(|| "failed to serialize param")?;

        let sign_headers =
            request_sign_header_gen(&self.cfg.access_key_id, &self.cfg.access_key_secret, &body)
                .with_context(|| "failed to generate auth headers")?;

        #[derive(Debug, Deserialize)]
        struct Response<T> {
            pub data: Option<T>,
            #[serde(flatten)]
            pub err: ResponseError,
        }

        let res = self
            .client
            .post(format!("{}{endpoint}", self.cfg.api_base))
            .headers(sign_headers)
            .header(reqwest::header::ACCEPT, "application/json")
            .header(reqwest::header::CONTENT_TYPE, "application/json")
            .body(body)
            .send()
            .await
            .with_context(|| "failed to send request")?
            .bytes()
            .await
            .with_context(|| "failed to read response body")?;

        let mut res: Response<R> = serde_json::from_slice(&res).with_context(|| {
            format!(
                "failed to parse response body, body: {}",
                to_string_hex(&res)
            )
        })?;

        if res.err.code != 0 {
            Err(res.err)
        } else if let Some(data) = res.data {
            Ok(data)
        } else {
            res.err.code = i64::MIN;
            Err(res.err)
        }
        .map_err(Into::into)
    }
}
