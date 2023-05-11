/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::backend_config::window_config::main_window_config::MainWindowConfig;
use crate::config::backend_config::window_config::viewer_window_config::ViewerWindowConfig;

pub mod main_window_config;
pub mod viewer_window_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WindowConfig {
  #[serde(default = "main_window_default")]
  pub main_window: MainWindowConfig,
  #[serde(default = "viewer_window_default")]
  pub viewer_window: ViewerWindowConfig,
}

fn main_window_default() -> MainWindowConfig {
  serde_json::from_str("{}").unwrap()
}

fn viewer_window_default() -> ViewerWindowConfig {
  serde_json::from_str("{}").unwrap()
}
