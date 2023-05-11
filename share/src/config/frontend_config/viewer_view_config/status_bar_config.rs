/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::viewer_view_config::status_bar_config::status_bar_component_config::StatusBarComponentConfig;

pub mod status_bar_component_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StatusBarConfig {
  #[serde(default = "enable_default")]
  pub enable: bool,
  #[serde(default = "mouse_transparent_default")]
  pub mouse_transparent: StatusBarComponentConfig,
  #[serde(default = "watched_default")]
  pub watched: StatusBarComponentConfig,
  #[serde(default = "activity_default")]
  pub activity: StatusBarComponentConfig,
  #[serde(default = "fans_num_default")]
  pub fans_num: StatusBarComponentConfig,
}

fn enable_default() -> bool {
  true
}

fn mouse_transparent_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn watched_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn activity_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}

fn fans_num_default() -> StatusBarComponentConfig {
  serde_json::from_str("{}").unwrap()
}
