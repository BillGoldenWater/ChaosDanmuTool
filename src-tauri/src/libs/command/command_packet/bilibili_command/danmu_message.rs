/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::libs::types::bilibili::emoji_data::EmojiData;
use crate::libs::types::bilibili::user_info::medal_info::MedalInfo;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/")]
pub struct DanmuMessage {
  fontsize: i32,
  color: i32,
  /**
   * ms
   * */
  timestamp: u64,
  danmu_type: DanmuType,
  emoji_data: EmojiData,

  content: String,

  uid: u64,
  u_name: String,
  is_admin: i32,
  is_vip: i32,
  is_svip: i32,

  medal_info: MedalInfo,

  user_ul: i32,

  user_title: String,
  user_title1: String,

  is_history: bool,
  count: i32,
}

impl DanmuMessage {
  pub fn from_raw(_raw: Value) -> DanmuMessage {
    todo!()
  }
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/danmuMessage/")]
pub enum DanmuType {
  Normal = 0,
  Emoji = 1,
  Unknown = 10086,
}

impl DanmuType {
  pub fn from_u32(value: u32) -> DanmuType {
    match value {
      0 => DanmuType::Normal,
      1 => DanmuType::Emoji,
      _ => DanmuType::Unknown,
    }
  }
}