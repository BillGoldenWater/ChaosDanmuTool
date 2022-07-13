/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::frontend_config::main_view_config::functions_config::danmu_gacha_config::DanmuGachaConfig;
use crate::libs::config::config::frontend_config::main_view_config::functions_config::room_connection_config::RoomConnectionConfig;

pub mod room_connection_config;
pub mod danmu_gacha_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/mainViewConfig/")]
pub struct FunctionsConfig {
  #[serde(default = "room_connection_default")]
  #[serde(skip_serializing_if = "room_connection_skip_if")]
  room_connection: RoomConnectionConfig,
  #[serde(default = "danmu_gacha_default")]
  #[serde(skip_serializing_if = "danmu_gacha_skip_if")]
  danmu_gacha: DanmuGachaConfig,
}

fn room_connection_default() -> RoomConnectionConfig {
  serde_json::from_str("{}").unwrap()
}

fn room_connection_skip_if(value: &RoomConnectionConfig) -> bool {
  *value == room_connection_default()
}

fn danmu_gacha_default() -> DanmuGachaConfig {
  serde_json::from_str("{}").unwrap()
}

fn danmu_gacha_skip_if(value: &DanmuGachaConfig) -> bool {
  *value == danmu_gacha_default()
}

