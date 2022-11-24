/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::Deserialize;

use crate::libs::network::api_request::bilibili_response::bilibili_get;

use super::bilibili_response;

static DANMU_SERVER_INFO_API_URL: &str =
  "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo";

pub struct DanmuServerInfoGetter {}

impl DanmuServerInfoGetter {
  pub async fn get(
    actual_room_id: u32,
  ) -> bilibili_response::ResponseResult<DanmuServerInfoResponse> {
    let url = format!("{}?id={}&type=0", DANMU_SERVER_INFO_API_URL, actual_room_id);

    bilibili_get(&url).await
  }

  pub async fn get_token_and_url(actual_room_id: u32) -> Result<DanmuServerAndToken, Error> {
    let res = DanmuServerInfoGetter::get(actual_room_id).await?;

    let data = res.data.unwrap();

    if !data.host_list.is_empty() {
      let host = &data.host_list[0];
      return Ok(DanmuServerAndToken {
        token: data.token,
        url: format!("wss://{}:{}/sub", host.host, host.wss_port),
      });
    }

    Ok(DanmuServerAndToken {
      token: data.token,
      url: "wss://broadcastlv.chat.bilibili.com/sub".to_string(),
    })
  }
}

#[derive(Debug)]
pub struct DanmuServerAndToken {
  pub token: String,
  pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct DanmuServerInfoResponse {
  pub group: String,
  pub business_id: i32,
  pub refresh_row_factor: f32,
  pub refresh_rate: i32,
  pub max_delay: i32,
  pub token: String,
  pub host_list: Vec<DanmuServerInfoHostInfo>,
}

#[derive(Debug, Deserialize)]
pub struct DanmuServerInfoHostInfo {
  pub host: String,
  pub port: i32,
  pub wss_port: i32,
  pub ws_port: i32,
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("{0}")]
  Request(#[from] bilibili_response::Error<DanmuServerInfoResponse>),
}
