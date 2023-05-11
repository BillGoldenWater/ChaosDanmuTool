/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::functions_config::danmu_gacha_config::DanmuGachaConfig;
use crate::config::frontend_config::main_view_config::functions_config::room_connection_config::RoomConnectionConfig;

pub mod danmu_gacha_config;
pub mod room_connection_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FunctionsConfig {
  #[serde(default = "room_connection_default")]
  pub room_connection: RoomConnectionConfig,
  #[serde(default = "danmu_gacha_default")]
  pub danmu_gacha: DanmuGachaConfig,
}

fn room_connection_default() -> RoomConnectionConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_gacha_default() -> DanmuGachaConfig {
  serde_json::from_str("{}").unwrap()
}
