/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::DanmuViewerCustomConfig;
use crate::config::frontend_config::viewer_view_config::status_bar_config::StatusBarConfig;
use crate::config::frontend_config::viewer_view_config::tts_config::TTSConfig;

pub mod danmu_viewer_custom_config;
pub mod status_bar_config;
pub mod tts_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ViewerViewConfig {
  #[serde(default = "uuid_default")]
  pub uuid: String,
  #[serde(default = "default_default")]
  pub default: bool,
  #[serde(default = "name_default")]
  pub name: String,
  #[serde(default = "background_color_default")]
  pub background_color: String,
  #[serde(default = "danmu_viewer_default")]
  pub danmu_viewer: DanmuViewerCustomConfig,
  #[serde(default = "tts_default")]
  pub tts: TTSConfig,
  #[serde(default = "status_bar_default")]
  pub status_bar: StatusBarConfig,
}

fn uuid_default() -> String {
  uuid::Uuid::from_u64_pair(0, 0).to_string()
}

fn default_default() -> bool {
  false
}

fn name_default() -> String {
  "".to_string()
}

fn background_color_default() -> String {
  "#3B3B3B44".to_string()
}

fn danmu_viewer_default() -> DanmuViewerCustomConfig {
  serde_json::from_str("{}").unwrap()
}

fn tts_default() -> TTSConfig {
  serde_json::from_str("{}").unwrap()
}

fn status_bar_default() -> StatusBarConfig {
  serde_json::from_str("{}").unwrap()
}