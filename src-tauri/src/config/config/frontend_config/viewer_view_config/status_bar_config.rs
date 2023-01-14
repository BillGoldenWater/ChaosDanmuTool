/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;
use crate::config::config::frontend_config::viewer_view_config::status_bar_config::status_bar_component_config::StatusBarComponentConfig;

pub mod status_bar_component_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/"
)]
pub struct StatusBarConfig {
  #[serde(default = "enable_default")]
  #[serde(skip_serializing_if = "enable_skip_if")]
  pub enable: bool,
  #[serde(default = "mouse_transparent_default")]
  #[serde(skip_serializing_if = "mouse_transparent_skip_if")]
  pub mouse_transparent: StatusBarComponentConfig,
  #[serde(default = "watched_default")]
  #[serde(skip_serializing_if = "watched_skip_if")]
  pub watched: StatusBarComponentConfig,
  #[serde(default = "activity_default")]
  #[serde(skip_serializing_if = "activity_skip_if")]
  pub activity: StatusBarComponentConfig,
  #[serde(default = "fans_num_default")]
  #[serde(skip_serializing_if = "fans_num_skip_if")]
  pub fans_num: StatusBarComponentConfig,
}

fn enable_default() -> bool {
  true
}

fn enable_skip_if(value: &bool) -> bool {
  *value == enable_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn mouse_transparent_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn mouse_transparent_skip_if(value: &StatusBarComponentConfig) -> bool {
  *value == mouse_transparent_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn watched_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn watched_skip_if(value: &StatusBarComponentConfig) -> bool {
  *value == watched_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn activity_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn activity_skip_if(value: &StatusBarComponentConfig) -> bool {
  *value == activity_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn fans_num_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn fans_num_skip_if(value: &StatusBarComponentConfig) -> bool {
  *value == fans_num_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
