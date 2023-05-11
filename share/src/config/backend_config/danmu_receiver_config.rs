/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuReceiverConfig {
  #[serde(default = "roomid_default")]
  pub roomid: u32,
  #[serde(default = "actual_roomid_default")]
  pub actual_roomid_cache: String, // "{roomid}|{actual_roomid}"
  #[serde(default = "heartbeat_interval_default")]
  pub heartbeat_interval: u8,
  #[serde(default = "auto_reconnect_default")]
  pub auto_reconnect: bool,
}

fn roomid_default() -> u32 {
  0
}

fn actual_roomid_default() -> String {
  "0|0".to_string()
}

fn heartbeat_interval_default() -> u8 {
  30
}

fn auto_reconnect_default() -> bool {
  true
}
