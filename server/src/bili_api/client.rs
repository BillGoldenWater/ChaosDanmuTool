use std::sync::Arc;

use anyhow::Context;
use reqwest::{Client, ClientBuilder};
use serde::Deserialize;
use share::{
    data_primitives::{auth_code::AuthCode, game_id::GameId},
    utils::{functional::Functional as _, hex},
};
use tracing::instrument;

use self::{
    api_app_batch_heartbeat::{ReqAppBatchHeartbeat, ResAppBatchHeartbeat},
    api_app_end::ReqAppEnd,
    api_app_heartbeat::ReqAppHeartbeat,
    api_app_start::{ReqAppStart, ResAppStart},
    config::BiliApiClientConfig,
};
use super::BiliRequest;
use crate::bili_api::{response_error::ResponseError, utils::signature::request_sign_header_gen};

pub mod api_app_batch_heartbeat;
pub mod api_app_end;
pub mod api_app_heartbeat;
pub mod api_app_start;
pub mod config;
pub mod data_type;

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
            .send(&ReqAppStart {
                app_id: self.app_id(),
                code,
            })
            .await
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_end(&self, game_id: GameId) -> anyhow::Result<()> {
        self.inner
            .send(&ReqAppEnd {
                app_id: self.app_id(),
                game_id,
            })
            .await
            .unit_result()
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_heartbeat(&self, game_id: GameId) -> anyhow::Result<()> {
        self.inner
            .send(&ReqAppHeartbeat { game_id })
            .await
            .unit_result()
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn app_heartbeat_batched(
        &self,
        game_ids: Vec<GameId>,
    ) -> anyhow::Result<ResAppBatchHeartbeat> {
        self.inner.send(&ReqAppBatchHeartbeat { game_ids }).await
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
            client: share::utils::reqwest::client()?,
            cfg: config,
        })
    }

    pub async fn send<Req: BiliRequest>(&self, param: &Req) -> anyhow::Result<Req::Response> {
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
            .post(format!("{}{}", self.cfg.api_base, Req::ENDPOINT))
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

        let mut res: Response<Req::Response> = serde_json::from_slice(&res).with_context(|| {
            format!(
                "failed to parse response body, body: {}",
                hex::to_string(&res)
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
