/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/config/frontendConfig/viewerViewConfig/statusBarConfig/"
)]
pub struct StatusBarComponentConfig {
  #[serde(default = "show_default")]
  #[serde(skip_serializing_if = "show_skip_if")]
  pub show: bool,
  #[serde(default = "format_number_default")]
  #[serde(skip_serializing_if = "format_number_skip_if")]
  pub format_number: bool,
}

fn show_default() -> bool {
  true
}

fn show_skip_if(value: &bool) -> bool {
  *value == show_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn format_number_default() -> bool {
  true
}

fn format_number_skip_if(value: &bool) -> bool {
  *value == format_number_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
