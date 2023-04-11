/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/config/backendConfig/"
)]
pub struct DanmuReceiverConfig {
  #[serde(default = "roomid_default")]
  #[serde(skip_serializing_if = "roomid_skip_if")]
  pub roomid: u32,
  #[serde(default = "actual_roomid_default")]
  #[serde(skip_serializing_if = "actual_roomid_skip_if")]
  pub actual_roomid_cache: String, // "{roomid}|{actual_roomid}"
  #[serde(default = "heartbeat_interval_default")]
  #[serde(skip_serializing_if = "heartbeat_interval_skip_if")]
  pub heartbeat_interval: u8,
  #[serde(default = "auto_reconnect_default")]
  #[serde(skip_serializing_if = "auto_reconnect_skip_if")]
  pub auto_reconnect: bool,
}

// region roomid
fn roomid_default() -> u32 {
  0
}

fn roomid_skip_if(value: &u32) -> bool {
  *value == roomid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

// region actual_roomid
fn actual_roomid_default() -> String {
  "0|0".to_string()
}

fn actual_roomid_skip_if(value: &String) -> bool {
  *value == actual_roomid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

// region heartbeat_interval
fn heartbeat_interval_default() -> u8 {
  30
}

fn heartbeat_interval_skip_if(value: &u8) -> bool {
  *value == heartbeat_interval_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

// region auto_reconnect
fn auto_reconnect_default() -> bool {
  true
}

fn auto_reconnect_skip_if(value: &bool) -> bool {
  *value == auto_reconnect_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion
