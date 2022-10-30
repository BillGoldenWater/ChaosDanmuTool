/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::command;

use crate::get_cfg;
use crate::libs::config::config::serialize_config;
use crate::libs::config::config_manager::{modify_cfg, ConfigManager};

#[command]
pub async fn get_config() -> String {
  serialize_config(&*get_cfg!(), false)
}

#[command]
pub async fn update_config(config: String) {
  modify_cfg(|cfg| **cfg = serde_json::from_str(&config).unwrap(), true).await
}
