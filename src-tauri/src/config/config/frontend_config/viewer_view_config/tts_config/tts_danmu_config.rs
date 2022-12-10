/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/ttsConfig/"
)]
pub struct TTSDanmuConfig {
  #[serde(default = "read_username_default")]
  #[serde(skip_serializing_if = "read_username_skip_if")]
  pub read_username: bool,
  #[serde(default = "filter_duplicate_content_delay_default")]
  #[serde(skip_serializing_if = "filter_duplicate_content_delay_skip_if")]
  pub filter_duplicate_content_delay: i32,
}

fn read_username_default() -> bool {
  false
}

fn read_username_skip_if(value: &bool) -> bool {
  *value == read_username_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn filter_duplicate_content_delay_default() -> i32 {
  30
}

fn filter_duplicate_content_delay_skip_if(value: &i32) -> bool {
  *value == filter_duplicate_content_delay_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
