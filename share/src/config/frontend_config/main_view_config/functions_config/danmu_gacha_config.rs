/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::functions_config::danmu_gacha_config::join_by_config::JoinByConfig;

pub mod join_by_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuGachaConfig {
  #[serde(default = "join_by_default")]
  pub join_by: JoinByConfig,
  #[serde(default = "fans_medal_level_default")]
  pub fans_medal_level: i32,
  #[serde(default = "user_level_default")]
  pub user_level: i32,
  #[serde(default = "win_num_default")]
  pub win_num: u32,
  #[serde(default = "reward_item_default")]
  pub reward_item: String,
}

fn join_by_default() -> JoinByConfig {
  JoinByConfig::Danmu {
    content: "".to_string(),
  }
}

fn fans_medal_level_default() -> i32 {
  -1
}

fn user_level_default() -> i32 {
  -1
}

fn win_num_default() -> u32 {
  0
}

fn reward_item_default() -> String {
  "".to_string()
}
