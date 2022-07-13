/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;
use crate::libs::config::config::backend_config::config_manager_config::ConfigManagerConfig;
use crate::libs::config::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;
use crate::libs::config::config::backend_config::http_server_config::HttpServerConfig;
use crate::libs::config::config::backend_config::updater_config::UpdaterConfig;
use crate::libs::config::config::backend_config::window_config::WindowConfig;

pub mod window_config;
pub mod http_server_config;
pub mod danmu_receiver_config;
pub mod config_manager_config;
pub mod updater_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/")]
pub struct BackendConfig {
  #[serde(default = "window_default")]
  #[serde(skip_serializing_if = "window_skip_if")]
  pub window: WindowConfig,
  #[serde(default = "http_server_default")]
  #[serde(skip_serializing_if = "http_server_skip_if")]
  pub http_server: HttpServerConfig,
  #[serde(default = "danmu_receiver_default")]
  #[serde(skip_serializing_if = "danmu_receiver_skip_if")]
  pub danmu_receiver: DanmuReceiverConfig,
  #[serde(default = "config_manager_default")]
  #[serde(skip_serializing_if = "config_manager_skip_if")]
  pub config_manager: ConfigManagerConfig,
  #[serde(default = "updater_default")]
  #[serde(skip_serializing_if = "updater_skip_if")]
  pub updater: UpdaterConfig,
}

//region defaults
fn window_default() -> WindowConfig {
  serde_json::from_str("{}").unwrap()
}

fn window_skip_if(value: &WindowConfig) -> bool {
  *value == window_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn http_server_default() -> HttpServerConfig {
  serde_json::from_str("{}").unwrap()
}

fn http_server_skip_if(value: &HttpServerConfig) -> bool {
  *value == http_server_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn danmu_receiver_default() -> DanmuReceiverConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_receiver_skip_if(value: &DanmuReceiverConfig) -> bool {
  *value == danmu_receiver_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn config_manager_default() -> ConfigManagerConfig {
  serde_json::from_str("{}").unwrap()
}

fn config_manager_skip_if(value: &ConfigManagerConfig) -> bool {
  *value == config_manager_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn updater_default() -> UpdaterConfig {
  serde_json::from_str("{}").unwrap()
}

fn updater_skip_if(value: &UpdaterConfig) -> bool {
  *value == updater_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion
