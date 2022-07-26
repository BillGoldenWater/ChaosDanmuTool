/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/userInfo/")]
pub struct MedalInfo {
  is_lighted: bool,

  anchor_roomid: u32,
  anchor_uname: String,

  guard_level: u8,

  medal_color: i32,
  medal_color_border: i32,
  medal_color_end: i32,
  medal_color_start: i32,

  medal_level: u16,
  medal_name: String,

  // unknown
  icon_id: i32,
  score: i32,
  special: String,
  target_id: i32,
}
