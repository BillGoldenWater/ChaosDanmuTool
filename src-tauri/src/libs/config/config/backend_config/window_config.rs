/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::backend_config::window_config::main_window_config::MainWindowConfig;
use crate::libs::config::config::backend_config::window_config::viewer_window_config::ViewerWindowConfig;
use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

pub mod main_window_config;
pub mod viewer_window_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
pub struct WindowConfig {
  #[serde(default = "main_window_default")]
  #[serde(skip_serializing_if = "main_window_skip_if")]
  pub main_window: MainWindowConfig,
  #[serde(default = "viewer_window_default")]
  #[serde(skip_serializing_if = "viewer_window_skip_if")]
  pub viewer_window: ViewerWindowConfig,
}

fn main_window_default() -> MainWindowConfig {
  serde_json::from_str("{}").unwrap()
}

fn main_window_skip_if(value: &MainWindowConfig) -> bool {
  *value == main_window_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn viewer_window_default() -> ViewerWindowConfig {
  serde_json::from_str("{}").unwrap()
}

fn viewer_window_skip_if(value: &ViewerWindowConfig) -> bool {
  *value == viewer_window_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
