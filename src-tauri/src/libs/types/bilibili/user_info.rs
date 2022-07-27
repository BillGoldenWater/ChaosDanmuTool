/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub mod medal_info;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/")]
pub struct UserInfo {
  #[serde(alias = "uname")]
  name: String,
  #[serde(alias = "user_level")]
  user_level: u32,

  face: String,
  #[serde(alias = "face_frame")]
  face_frame: String,

  #[serde(alias = "is_vip")]
  is_vip: u8,
  #[serde(alias = "is_svip")]
  is_svip: u8,
  #[serde(alias = "is_main_vip")]
  is_main_vip: u8,
  #[serde(alias = "manager")]
  is_manager: u8,

  #[serde(alias = "guard_level")]
  guard_level: u8,
  #[serde(alias = "level_color")]
  level_color: String,
  #[serde(alias = "name_color")]
  name_color: String,
  title: String,
}

impl UserInfo {
  pub fn empty() -> UserInfo{
    UserInfo{
      name: "".to_string(),
      user_level: 0,
      face: "".to_string(),
      face_frame: "".to_string(),
      is_vip: 0,
      is_svip: 0,
      is_main_vip: 0,
      is_manager: 0,
      guard_level: 0,
      level_color: "".to_string(),
      name_color: "".to_string(),
      title: "".to_string()
    }
  }

  pub fn parse(str: &str) -> Result<UserInfo, serde_json::Error> {
    serde_json::from_str(str)
  }
}