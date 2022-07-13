/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::DanmuViewerCustomConfig;
use crate::libs::config::config::frontend_config::viewer_view_config::status_bar_config::StatusBarConfig;
use crate::libs::config::config::frontend_config::viewer_view_config::tts_config::TTSConfig;

pub mod danmu_viewer_custom_config;
pub mod tts_config;
pub mod status_bar_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/")]
pub struct ViewerViewConfig {
  #[serde(default = "danmu_viewer_default")]
  #[serde(skip_serializing_if = "danmu_viewer_skip_if")]
  danmu_viewer: DanmuViewerCustomConfig,
  #[serde(default = "tts_default")]
  #[serde(skip_serializing_if = "tts_skip_if")]
  tts: TTSConfig,
  #[serde(default = "status_bar_default")]
  #[serde(skip_serializing_if = "status_bar_skip_if")]
  status_bar:StatusBarConfig,
}

fn danmu_viewer_default() -> DanmuViewerCustomConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_viewer_skip_if(value: &DanmuViewerCustomConfig) -> bool {
  *value == danmu_viewer_default()
}

fn tts_default() -> TTSConfig {
  serde_json::from_str("{}").unwrap()
}

fn tts_skip_if(value: &TTSConfig) -> bool {
  *value == tts_default()
}

fn status_bar_default() -> StatusBarConfig {
  serde_json::from_str("{}").unwrap()
}

fn status_bar_skip_if(value: &StatusBarConfig) -> bool {
  *value == status_bar_default()
}
