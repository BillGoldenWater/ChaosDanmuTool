/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/danmuViewerCustomConfig/")]
pub struct DanmuMergeConfig {
  #[serde(default = "interval_default")]
  #[serde(skip_serializing_if = "interval_skip_if")]
  interval: i32,
  #[serde(default = "merge_different_user_default")]
  #[serde(skip_serializing_if = "merge_different_user_skip_if")]
  merge_different_user: bool,
}

fn interval_default() -> i32 {
  30
}

fn interval_skip_if(value: &i32) -> bool {
  *value == interval_default()
}

fn merge_different_user_default() -> bool {
  true
}

fn merge_different_user_skip_if(value: &bool) -> bool {
  *value == merge_different_user_default()
}
