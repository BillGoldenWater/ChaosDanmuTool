/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::network::api_request::bilibili_response::bilibili_get;

use super::bilibili_response;

static GIFT_CONFIG_API_URL: &str =
  "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig";

pub struct GiftConfigGetter {}

impl GiftConfigGetter {
  pub async fn get(room_id: u32) -> bilibili_response::ResponseResult<Value> {
    let url = format!("{}?platform=pc&room_id={}", GIFT_CONFIG_API_URL, room_id);

    bilibili_get(&url).await
  }
}
