/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/config/frontendConfig/viewerViewConfig/danmuViewerCustomConfig/"
)]
pub struct DanmuFilterConfig {
  #[serde(default = "type_blacklist_default")]
  #[serde(skip_serializing_if = "type_blacklist_skip_if")]
  pub type_blacklist: Vec<String>,
  #[serde(default = "content_blacklist_default")]
  #[serde(skip_serializing_if = "content_blacklist_skip_if")]
  pub content_blacklist: Vec<String>,
}

fn type_blacklist_default() -> Vec<String> {
  vec![]
}

fn type_blacklist_skip_if(value: &Vec<String>) -> bool {
  *value == type_blacklist_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn content_blacklist_default() -> Vec<String> {
  vec![]
}

fn content_blacklist_skip_if(value: &Vec<String>) -> bool {
  *value == content_blacklist_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
