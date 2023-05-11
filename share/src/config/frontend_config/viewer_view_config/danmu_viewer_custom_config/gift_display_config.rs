/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GiftDisplayConfig {
  #[serde(default = "merge_interval_default")]
  pub merge_interval: i32,
  #[serde(default = "show_price_default")]
  pub show_price: bool,
}

fn merge_interval_default() -> i32 {
  10
}

fn show_price_default() -> bool {
  true
}
