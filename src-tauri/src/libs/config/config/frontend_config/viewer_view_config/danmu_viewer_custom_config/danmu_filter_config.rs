/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/danmuViewerCustomConfig/")]
pub struct DanmuFilterConfig {
  #[serde(default = "type_blacklist_default")]
  #[serde(skip_serializing_if = "type_blacklist_skip_if")]
  type_blacklist: Vec<String>,
  #[serde(default = "content_blacklist_default")]
  #[serde(skip_serializing_if = "content_blacklist_skip_if")]
  content_blacklist: Vec<String>
}

fn type_blacklist_default() -> Vec<String> {
  vec![]
}

fn type_blacklist_skip_if(value: &Vec<String>) -> bool {
  *value == type_blacklist_default()
}

fn content_blacklist_default() -> Vec<String> {
  vec![]
}

fn content_blacklist_skip_if(value: &Vec<String>) -> bool {
  *value == content_blacklist_default()
}
