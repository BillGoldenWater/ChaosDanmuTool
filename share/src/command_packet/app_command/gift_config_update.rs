/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GiftConfigUpdate {
  gift_config: Vec<GiftConfigItem>,
}

impl GiftConfigUpdate {
  pub fn new(gift_config: Vec<GiftConfigItem>) -> GiftConfigUpdate {
    GiftConfigUpdate { gift_config }
  }
}

#[derive(serde::Deserialize, serde::Serialize, PartialEq, Eq, Debug, Clone)]
pub struct GiftConfigItem {
  pub id: i32,
  pub name: String,
  pub price: i32,
  pub coin_type: CoinType,
  pub webp: String,
  pub img_basic: String,
}

#[derive(serde::Deserialize, serde::Serialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum CoinType {
  Gold,
  Silver,
}
