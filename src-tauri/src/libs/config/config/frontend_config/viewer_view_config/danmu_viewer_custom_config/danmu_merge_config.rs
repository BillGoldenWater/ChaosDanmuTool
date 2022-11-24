/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/danmuViewerCustomConfig/"
)]
pub struct DanmuMergeConfig {
  #[serde(default = "interval_default")]
  #[serde(skip_serializing_if = "interval_skip_if")]
  pub interval: i32,
  #[serde(default = "merge_different_user_default")]
  #[serde(skip_serializing_if = "merge_different_user_skip_if")]
  pub merge_different_user: bool,
}

fn interval_default() -> i32 {
  30
}

fn interval_skip_if(value: &i32) -> bool {
  *value == interval_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn merge_different_user_default() -> bool {
  true
}

fn merge_different_user_skip_if(value: &bool) -> bool {
  *value == merge_different_user_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
