/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::backend_config::config_manager_config::ConfigManagerConfig;
use crate::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;
use crate::config::backend_config::http_server_config::HttpServerConfig;
use crate::config::backend_config::updater_config::UpdaterConfig;
use crate::config::backend_config::window_config::WindowConfig;

pub mod config_manager_config;
pub mod danmu_receiver_config;
pub mod http_server_config;
pub mod updater_config;
pub mod window_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BackendConfig {
  #[serde(default = "window_default")]
  pub window: WindowConfig,
  #[serde(default = "http_server_default")]
  pub http_server: HttpServerConfig,
  #[serde(default = "danmu_receiver_default")]
  pub danmu_receiver: DanmuReceiverConfig,
  #[serde(default = "config_manager_default")]
  pub config_manager: ConfigManagerConfig,
  #[serde(default = "updater_default")]
  pub updater: UpdaterConfig,
}

fn window_default() -> WindowConfig {
  serde_json::from_str("{}").unwrap()
}

fn http_server_default() -> HttpServerConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_receiver_default() -> DanmuReceiverConfig {
  serde_json::from_str("{}").unwrap()
}

fn config_manager_default() -> ConfigManagerConfig {
  serde_json::from_str("{}").unwrap()
}

fn updater_default() -> UpdaterConfig {
  serde_json::from_str("{}").unwrap()
}
