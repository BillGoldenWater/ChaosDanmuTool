/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::viewer_view_config::tts_config::tts_blacklist_config::TTSBlacklistConfig;
use crate::config::frontend_config::viewer_view_config::tts_config::tts_danmu_config::TTSDanmuConfig;
use crate::config::frontend_config::viewer_view_config::tts_config::tts_text_replacer::TTSTextReplacer;

pub mod tts_blacklist_config;
pub mod tts_danmu_config;
pub mod tts_text_replacer;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TTSConfig {
  #[serde(default = "enable_default")]
  pub enable: bool,
  #[serde(default = "max_queue_length_default")]
  pub max_queue_length: u32,
  #[serde(default = "rate_default")]
  pub rate: f32,
  #[serde(default = "pitch_default")]
  pub pitch: f32,
  #[serde(default = "volume_default")]
  pub volume: f32,
  #[serde(default = "tts_blacklist_default")]
  pub tts_blacklist: Vec<TTSBlacklistConfig>,
  #[serde(default = "tts_text_replacer_default")]
  pub tts_text_replacer: Vec<TTSTextReplacer>,
  #[serde(default = "tts_danmu_default")]
  pub tts_danmu: TTSDanmuConfig,
}

fn enable_default() -> bool {
  false
}

fn max_queue_length_default() -> u32 {
  2
}

fn rate_default() -> f32 {
  1.0
}

fn pitch_default() -> f32 {
  1.0
}

fn volume_default() -> f32 {
  1.0
}

fn tts_blacklist_default() -> Vec<TTSBlacklistConfig> {
  vec![]
}

fn tts_text_replacer_default() -> Vec<TTSTextReplacer> {
  vec![]
}

fn tts_danmu_default() -> TTSDanmuConfig {
  serde_json::from_str("{}").unwrap()
}
