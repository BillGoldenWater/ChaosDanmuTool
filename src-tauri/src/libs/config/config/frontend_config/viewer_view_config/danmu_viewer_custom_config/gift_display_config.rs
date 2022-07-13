/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/danmuViewerStyleConfig/")]
pub struct GiftDisplayConfig {
  #[serde(default = "merge_interval_default")]
  #[serde(skip_serializing_if = "merge_interval_skip_if")]
  merge_interval: i32,
  #[serde(default = "show_price_default")]
  #[serde(skip_serializing_if = "show_price_skip_if")]
  show_price: bool,
}

fn merge_interval_default() -> i32 {
  10
}

fn merge_interval_skip_if(value: &i32) -> bool {
  *value == merge_interval_default()
}

fn show_price_default() -> bool {
  true
}

fn show_price_skip_if(value: &bool) -> bool {
  *value == show_price_default()
}

