/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::Deserialize;

use crate::libs::network::api_request::bilibili_response::BiliBiliResponse;

static DANMU_SERVER_INFO_API_URL: &str =
  "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo";

pub struct DanmuServerInfoGetter {}

impl DanmuServerInfoGetter {
  pub async fn get(actual_room_id: i32) -> Option<BiliBiliResponse<DanmuServerInfoResponse>> {
    let url = format!("{}?id={}", DANMU_SERVER_INFO_API_URL, actual_room_id);

    let result = reqwest::get(url.as_str()).await;
    if result.is_err() {
      return None;
    }

    let text_result = result.unwrap().text().await;
    if text_result.is_err() {
      return None;
    }

    let text = text_result.unwrap();

    let serde_result =
      serde_json::from_str(text.as_str());

    if serde_result.is_err() {
      println!("failed parsing: {}", text);
    }

    let response: BiliBiliResponse<DanmuServerInfoResponse> = serde_result.unwrap();

    Some(response)
  }

  pub async fn get_token_and_url(actual_room_id: i32) -> Option<DanmuServerAndToken> {
    let data =
      DanmuServerInfoGetter::get(actual_room_id).await;

    if data.is_none() {
      return None;
    }

    if let Some(data) = data.unwrap().data {
      return if !data.host_list.is_empty() {
        let host = data.host_list.get(0).unwrap();
        Some(DanmuServerAndToken {
          token: data.token,
          url: format!("wss://{}:{}/sub", host.host, host.wss_port).to_string(),
        })
      } else {
        Some(DanmuServerAndToken {
          token: data.token,
          url: "wss://broadcastlv.chat.bilibili.com/sub".to_string(),
        })
      }
    }

    None
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