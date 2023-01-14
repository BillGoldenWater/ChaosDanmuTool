/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::frontend_config::viewer_view_config::tts_config::tts_blacklist_config::TTSBlacklistConfig;
use crate::config::config::frontend_config::viewer_view_config::tts_config::tts_danmu_config::TTSDanmuConfig;
use crate::config::config::frontend_config::viewer_view_config::tts_config::tts_text_replacer::TTSTextReplacer;
use crate::config::config::ALLOW_CONFIG_SKIP_IF;

pub mod tts_blacklist_config;
pub mod tts_danmu_config;
pub mod tts_text_replacer;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/frontendConfig/viewerViewConfig/"
)]
pub struct TTSConfig {
  #[serde(default = "enable_default")]
  #[serde(skip_serializing_if = "enable_skip_if")]
  pub enable: bool,
  #[serde(default = "max_queue_length_default")]
  #[serde(skip_serializing_if = "max_queue_length_skip_if")]
  pub max_queue_length: u32,
  #[serde(default = "rate_default")]
  #[serde(skip_serializing_if = "rate_skip_if")]
  pub rate: f32,
  #[serde(default = "pitch_default")]
  #[serde(skip_serializing_if = "pitch_skip_if")]
  pub pitch: f32,
  #[serde(default = "volume_default")]
  #[serde(skip_serializing_if = "volume_skip_if")]
  pub volume: f32,
  #[serde(default = "tts_blacklist_default")]
  #[serde(skip_serializing_if = "tts_blacklist_skip_if")]
  pub tts_blacklist: Vec<TTSBlacklistConfig>,
  #[serde(default = "tts_text_replacer_default")]
  #[serde(skip_serializing_if = "tts_text_replacer_skip_if")]
  pub tts_text_replacer: Vec<TTSTextReplacer>,
  #[serde(default = "tts_danmu_default")]
  #[serde(skip_serializing_if = "tts_danmu_skip_if")]
  pub tts_danmu: TTSDanmuConfig,
}

fn enable_default() -> bool {
  false
}

fn enable_skip_if(value: &bool) -> bool {
  *value == enable_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn max_queue_length_default() -> u32 {
  2
}

fn max_queue_length_skip_if(value: &u32) -> bool {
  *value == max_queue_length_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn rate_default() -> f32 {
  1.0
}

fn rate_skip_if(value: &f32) -> bool {
  *value == rate_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn pitch_default() -> f32 {
  1.0
}

fn pitch_skip_if(value: &f32) -> bool {
  *value == pitch_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn volume_default() -> f32 {
  1.0
}

fn volume_skip_if(value: &f32) -> bool {
  *value == volume_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn tts_blacklist_default() -> Vec<TTSBlacklistConfig> {
  vec![]
}

fn tts_blacklist_skip_if(value: &Vec<TTSBlacklistConfig>) -> bool {
  *value == tts_blacklist_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn tts_text_replacer_default() -> Vec<TTSTextReplacer> {
  vec![]
}

fn tts_text_replacer_skip_if(value: &Vec<TTSTextReplacer>) -> bool {
  *value == tts_text_replacer_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn tts_danmu_default() -> TTSDanmuConfig {
  serde_json::from_str("{}").unwrap()
}

fn tts_danmu_skip_if(value: &TTSDanmuConfig) -> bool {
  *value == tts_danmu_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
