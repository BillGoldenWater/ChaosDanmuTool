/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/userInfo/")]
pub struct MedalInfo {
  #[serde(alias = "is_lighted")]
  is_lighted: u8,

  #[serde(alias = "anchor_roomid")]
  anchor_roomid: u32,
  #[serde(alias = "anchor_uname")]
  #[serde(default)]
  anchor_uname: String,

  #[serde(alias = "guard_level")]
  guard_level: u8,

  #[serde(alias = "medal_color")]
  medal_color: i32,
  #[serde(alias = "medal_color_border")]
  medal_color_border: i32,
  #[serde(alias = "medal_color_end")]
  medal_color_end: i32,
  #[serde(alias = "medal_color_start")]
  medal_color_start: i32,

  #[serde(alias = "medal_level")]
  medal_level: u16,
  #[serde(alias = "medal_name")]
  medal_name: String,
  // unknown
  // icon_id: i32,
  // score: i32,
  // special: String,
  // target_id: i32,
}

impl MedalInfo {
  pub fn empty() -> MedalInfo {
    MedalInfo {
      is_lighted: 0,
      anchor_roomid: 0,
      anchor_uname: "".to_string(),
      guard_level: 0,
      medal_color: 0,
      medal_color_border: 0,
      medal_color_end: 0,
      medal_color_start: 0,
      medal_level: 0,
      medal_name: "".to_string(),
    }
  }

  pub fn parse(str: &str) -> Result<MedalInfo, serde_json::Error> {
    serde_json::from_str(str)
  }

  pub fn from_raw(raw: &Value) -> MedalInfo {
    let mut result = MedalInfo::empty();

    result.medal_level = raw[0].as_u64().unwrap_or(0) as u16;
    result.medal_name = raw[1].as_str().unwrap_or("").to_string();
    result.anchor_uname = raw[2].as_str().unwrap_or("").to_string();
    result.anchor_roomid = raw[3].as_u64().unwrap_or(0) as u32;
    result.medal_color = raw[4].as_i64().unwrap_or(0) as i32;
    result.medal_color_border = raw[7].as_i64().unwrap_or(0) as i32;
    result.medal_color_start = raw[8].as_i64().unwrap_or(0) as i32;
    result.medal_color_end = raw[9].as_i64().unwrap_or(0) as i32;
    result.guard_level = raw[10].as_u64().unwrap_or(0) as u8;
    result.is_lighted = raw[11].as_u64().unwrap_or(0) as u8;

    result
  }
}
