/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Debug, Clone)]
pub struct MedalInfo {
  is_lighted: u8,

  anchor_roomid: u32,
  #[serde(default)]
  anchor_uname: String,

  guard_level: u8,

  medal_color: i32,
  medal_color_border: i32,
  medal_color_end: i32,
  medal_color_start: i32,

  medal_level: u16,
  medal_name: String,
  // unknown
  // icon_id: i32,
  // score: i32,
  // special: String,
  // target_id: i32,
}

impl MedalInfo {
  pub fn parse(str: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(str)
  }
}
