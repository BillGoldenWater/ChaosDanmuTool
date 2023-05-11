/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::command;

use crate::app::config_manager::{modify_cfg, ConfigManager};
use crate::get_cfg;

#[command]
pub async fn get_config() -> String {
  serde_json::to_string(&*get_cfg!()).unwrap()
}

#[command]
pub async fn update_config(config: String) {
  modify_cfg(|cfg| **cfg = serde_json::from_str(&config).unwrap(), true).await
}
