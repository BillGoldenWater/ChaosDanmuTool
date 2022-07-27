/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/")]
pub struct ActivityUpdate {
  activity: u32,
}

impl ActivityUpdate {
  pub fn new(activity: u32) -> ActivityUpdate {
    ActivityUpdate {
      activity
    }
  }
}