/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub mod medal_info;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
pub struct UserInfo {
  #[serde(alias = "uname")]
  name: String,
  user_level: u32,

  face: String,
  face_frame: String,

  is_vip: u8,
  is_svip: u8,
  is_main_vip: u8,
  #[serde(alias = "manager")]
  is_manager: u8,

  guard_level: u8,
  level_color: String,
  name_color: String,
  title: String,
}

impl UserInfo {
  pub fn parse(str: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(str)
  }
}
