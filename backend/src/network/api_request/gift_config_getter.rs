/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chaos_danmu_tool_share::command_packet::app_command::gift_config_update::GiftConfigItem;

use crate::network::api_request::bilibili_response::bilibili_get;

use super::bilibili_response;

static GIFT_CONFIG_API_URL: &str =
  "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig";

pub struct GiftConfigGetter {}

impl GiftConfigGetter {
  pub async fn get() -> bilibili_response::ResponseResult<GiftConfig> {
    let url = format!("{}?platform=pc", GIFT_CONFIG_API_URL);

    bilibili_get(&url).await
  }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct GiftConfig {
  #[serde(default)]
  pub list: Vec<GiftConfigItem>,
}
