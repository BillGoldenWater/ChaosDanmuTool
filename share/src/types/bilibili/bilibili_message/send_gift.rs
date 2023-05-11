/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::types::bilibili::user_info::medal_info::MedalInfo;

#[derive(Debug, serde::Deserialize)]
pub struct SendGift {
  #[serde(rename = "giftId")]
  pub gift_id: u32,
  #[serde(rename = "giftName")]
  pub gift_name: String,
  pub coin_type: String,
  pub price: u32,
  pub num: u32,
  pub action: String,
  pub uid: u64,
  pub uname: String,
  pub name_color: String,
  pub face: String,
  pub medal_info: MedalInfo,
  pub timestamp: u64,
  pub dmscore: u32,
}
