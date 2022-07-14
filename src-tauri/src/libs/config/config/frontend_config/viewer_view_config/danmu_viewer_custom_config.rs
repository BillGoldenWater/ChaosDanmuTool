/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;
use crate::libs::config::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::danmu_filter_config::DanmuFilterConfig;
use crate::libs::config::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::danmu_merge_config::DanmuMergeConfig;
use crate::libs::config::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::gift_display_config::GiftDisplayConfig;

pub mod danmu_filter_config;
pub mod danmu_merge_config;
pub mod gift_display_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/")]
pub struct DanmuViewerCustomConfig {
  #[serde(default = "danmu_filter_default")]
  #[serde(skip_serializing_if = "danmu_filter_skip_if")]
  pub danmu_filter: DanmuFilterConfig,
  #[serde(default = "danmu_merge_default")]
  #[serde(skip_serializing_if = "danmu_merge_skip_if")]
  pub danmu_merge: DanmuMergeConfig,
  #[serde(default = "gift_display_default")]
  #[serde(skip_serializing_if = "gift_display_skip_if")]
  pub gift_display: GiftDisplayConfig,

  #[serde(default = "super_chat_always_on_top_default")]
  #[serde(skip_serializing_if = "super_chat_always_on_top_skip_if")]
  pub super_chat_always_on_top: bool,
  #[serde(default = "show_avatar_default")]
  #[serde(skip_serializing_if = "show_avatar_skip_if")]
  pub show_avatar: bool,
}

fn danmu_filter_default() -> DanmuFilterConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_filter_skip_if(value: &DanmuFilterConfig) -> bool {
  *value == danmu_filter_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn danmu_merge_default() -> DanmuMergeConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_merge_skip_if(value: &DanmuMergeConfig) -> bool {
  *value == danmu_merge_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn gift_display_default() -> GiftDisplayConfig {
  serde_json::from_str("{}").unwrap()
}

fn gift_display_skip_if(value: &GiftDisplayConfig) -> bool {
  *value == gift_display_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn super_chat_always_on_top_default() -> bool {
  true
}

fn super_chat_always_on_top_skip_if(value: &bool) -> bool {
  *value == super_chat_always_on_top_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn show_avatar_default() -> bool {
  true
}

fn show_avatar_skip_if(value: &bool) -> bool {
  *value == show_avatar_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}


