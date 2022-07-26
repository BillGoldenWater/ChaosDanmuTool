/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub mod medal_info;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/")]
pub struct UserInfo {
  name: String,
  user_level: u32,

  face: String,
  face_frame: String,

  is_vip: bool,
  is_svip: bool,
  is_main_vip: bool,
  is_manager: bool,

  guard_level: u8,
  level_color: String,
  name_color: String,
  title: String,
}