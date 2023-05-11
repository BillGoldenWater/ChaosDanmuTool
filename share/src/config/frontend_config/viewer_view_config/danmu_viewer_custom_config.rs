/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::danmu_filter_config::DanmuFilterConfig;
use crate::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::danmu_merge_config::DanmuMergeConfig;
use crate::config::frontend_config::viewer_view_config::danmu_viewer_custom_config::gift_display_config::GiftDisplayConfig;

pub mod danmu_filter_config;
pub mod danmu_merge_config;
pub mod gift_display_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuViewerCustomConfig {
  #[serde(default = "danmu_filter_default")]
  pub danmu_filter: DanmuFilterConfig,
  #[serde(default = "danmu_merge_default")]
  pub danmu_merge: DanmuMergeConfig,
  #[serde(default = "gift_display_default")]
  pub gift_display: GiftDisplayConfig,

  #[serde(default = "super_chat_always_on_top_default")]
  pub super_chat_always_on_top: bool,
  #[serde(default = "show_avatar_default")]
  pub show_avatar: bool,
}

fn danmu_filter_default() -> DanmuFilterConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_merge_default() -> DanmuMergeConfig {
  serde_json::from_str("{}").unwrap()
}

fn gift_display_default() -> GiftDisplayConfig {
  serde_json::from_str("{}").unwrap()
}

fn super_chat_always_on_top_default() -> bool {
  true
}

fn show_avatar_default() -> bool {
  true
}
