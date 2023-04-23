/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
pub struct MedalInfo {
  pub is_lighted: u8,

  pub anchor_roomid: u32,
  #[serde(default)]
  pub anchor_uname: String,

  pub guard_level: u8,

  pub medal_color: i32,
  pub medal_color_border: i32,
  pub medal_color_end: i32,
  pub medal_color_start: i32,

  pub medal_level: u32,
  pub medal_name: String,

  /// anchor user uid
  pub target_id: u64,
  // unknown
  // icon_id: i32,
  // special: String,
}

impl MedalInfo {
  pub fn parse(str: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(str)
  }
}
