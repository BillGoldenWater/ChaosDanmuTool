/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::backend_config::danmu_receiver_config::actual_roomid_cache::ActualRoomidCache;

pub mod actual_roomid_cache;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuReceiverConfig {
  #[serde(default)]
  pub roomid: u32,
  #[serde(default)]
  pub actual_roomid_cache: ActualRoomidCache,
  #[serde(default = "heartbeat_interval_default")]
  pub heartbeat_interval: u8,
  #[serde(default = "auto_reconnect_default")]
  pub auto_reconnect: bool,
}

fn heartbeat_interval_default() -> u8 {
  30
}

fn auto_reconnect_default() -> bool {
  true
}
