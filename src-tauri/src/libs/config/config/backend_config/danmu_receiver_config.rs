/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
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
}

fn roomid_default() -> u32 {
  0
}

fn roomid_skip_if(value: &u32) -> bool {
  *value == roomid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn actual_roomid_default() -> String {
  "0|0".to_string()
}

fn actual_roomid_skip_if(value: &String) -> bool {
  *value == actual_roomid_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}


fn heartbeat_interval_default() -> u8 {
  30
}

fn heartbeat_interval_skip_if(value: &u8) -> bool {
  *value == heartbeat_interval_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
