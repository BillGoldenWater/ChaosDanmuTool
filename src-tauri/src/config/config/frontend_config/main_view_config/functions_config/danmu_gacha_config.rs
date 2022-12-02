/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;
use crate::config::config::frontend_config::main_view_config::functions_config::danmu_gacha_config::join_by_config::JoinByConfig;

pub mod join_by_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
export,
export_to = "../src/share/type/rust/config/frontendConfig/mainViewConfig/functionsConfig/"
)]
pub struct DanmuGachaConfig {
  #[serde(default = "join_by_default")]
  #[serde(skip_serializing_if = "join_by_skip_if")]
  pub join_by: JoinByConfig,
  #[serde(default = "fans_medal_level_default")]
  #[serde(skip_serializing_if = "fans_medal_level_skip_if")]
  pub fans_medal_level: i32,
  #[serde(default = "user_level_default")]
  #[serde(skip_serializing_if = "user_level_skip_if")]
  pub user_level: i32,
  #[serde(default = "win_num_default")]
  #[serde(skip_serializing_if = "win_num_skip_if")]
  pub win_num: u32,
  #[serde(default = "reward_item_default")]
  #[serde(skip_serializing_if = "reward_item_skip_if")]
  pub reward_item: String,
}

fn join_by_default() -> JoinByConfig {
  JoinByConfig::Danmu {
    content: "".to_string(),
  }
}

fn join_by_skip_if(value: &JoinByConfig) -> bool {
  *value == join_by_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn fans_medal_level_default() -> i32 {
  -1
}

fn fans_medal_level_skip_if(value: &i32) -> bool {
  *value == fans_medal_level_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn user_level_default() -> i32 {
  -1
}

fn user_level_skip_if(value: &i32) -> bool {
  *value == user_level_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn win_num_default() -> u32 {
  0
}

fn win_num_skip_if(value: &u32) -> bool {
  *value == win_num_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn reward_item_default() -> String {
  "".to_string()
}

fn reward_item_skip_if(value: &String) -> bool {
  *value == reward_item_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
