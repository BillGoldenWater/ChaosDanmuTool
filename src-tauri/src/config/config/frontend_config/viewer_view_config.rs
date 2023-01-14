/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::DanmuViewerCustomConfig;
use crate::config::config::frontend_config::viewer_view_config::status_bar_config::StatusBarConfig;
use crate::config::config::frontend_config::viewer_view_config::tts_config::TTSConfig;
use crate::config::config::ALLOW_CONFIG_SKIP_IF;

pub mod danmu_viewer_custom_config;
pub mod status_bar_config;
pub mod tts_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/")]
pub struct ViewerViewConfig {
  #[serde(default = "uuid_default")]
  #[serde(skip_serializing_if = "uuid_skip_if")]
  pub uuid: String,
  #[serde(default = "default_default")]
  #[serde(skip_serializing_if = "default_skip_if")]
  pub default: bool,
  #[serde(default = "name_default")]
  #[serde(skip_serializing_if = "name_skip_if")]
  pub name: String,
  #[serde(default = "background_color_default")]
  #[serde(skip_serializing_if = "background_color_skip_if")]
  pub background_color: String,
  #[serde(default = "danmu_viewer_default")]
  #[serde(skip_serializing_if = "danmu_viewer_skip_if")]
  pub danmu_viewer: DanmuViewerCustomConfig,
  #[serde(default = "tts_default")]
  #[serde(skip_serializing_if = "tts_skip_if")]
  pub tts: TTSConfig,
  #[serde(default = "status_bar_default")]
  #[serde(skip_serializing_if = "status_bar_skip_if")]
  pub status_bar: StatusBarConfig,
}

//region uuid
fn uuid_default() -> String {
  uuid::Uuid::from_u64_pair(0, 0).to_string()
}

fn uuid_skip_if(value: &String) -> bool {
  *value == uuid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

// region default
fn default_default() -> bool {
  false
}

fn default_skip_if(value: &bool) -> bool {
  *value == default_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

//region name
fn name_default() -> String {
  "".to_string()
}

fn name_skip_if(value: &String) -> bool {
  *value == name_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

// region background_color
fn background_color_default() -> String {
  "#3B3B3B44".to_string()
}

fn background_color_skip_if(value: &String) -> bool {
  *value == background_color_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

//region danmu_viewer
fn danmu_viewer_default() -> DanmuViewerCustomConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_viewer_skip_if(value: &DanmuViewerCustomConfig) -> bool {
  *value == danmu_viewer_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

//region tts
fn tts_default() -> TTSConfig {
  serde_json::from_str("{}").unwrap()
}

fn tts_skip_if(value: &TTSConfig) -> bool {
  *value == tts_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

//region status_bar
fn status_bar_default() -> StatusBarConfig {
  serde_json::from_str("{}").unwrap()
}

fn status_bar_skip_if(value: &StatusBarConfig) -> bool {
  *value == status_bar_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion
