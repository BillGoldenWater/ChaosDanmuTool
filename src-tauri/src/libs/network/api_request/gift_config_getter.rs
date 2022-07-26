/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::libs::network::api_request::bilibili_response::{BiliBiliResponse, execute_request};

static GIFT_CONFIG_API_URL: &str =
  "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig";

pub struct GiftConfigGetter {}

impl GiftConfigGetter {
  pub async fn get(room_id: i32) -> Option<BiliBiliResponse<Value>> {
    let url = format!("{}?platform=pc&room_id={}", GIFT_CONFIG_API_URL, room_id);

    execute_request(url.as_str()).await
  }
}