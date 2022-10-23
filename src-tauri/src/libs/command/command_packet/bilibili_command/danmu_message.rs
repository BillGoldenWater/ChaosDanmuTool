/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::libs::types::bilibili::emoji_data::EmojiData;
use crate::libs::types::bilibili::user_info::medal_info::MedalInfo;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/"
)]
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
  is_manager: bool,
  is_vip: bool,
  is_svip: bool,

  medal_info: MedalInfo,

  user_ul: i32,

  user_title: String,

  is_history: bool,
  is_special_type: bool,
  count: i32,
}

impl DanmuMessage {
  pub fn empty() -> DanmuMessage {
    DanmuMessage {
      fontsize: 0,
      color: 0,
      timestamp: 0,
      danmu_type: DanmuType::Unknown,
      emoji_data: EmojiData::empty(),
      content: "".to_string(),
      uid: 0,
      u_name: "".to_string(),
      is_manager: false,
      is_vip: false,
      is_svip: false,
      medal_info: MedalInfo::empty(),
      user_ul: 0,
      user_title: "".to_string(),
      is_history: false,
      is_special_type: false,
      count: 1,
    }
  }

  pub fn from_raw(raw: &Value) -> Result<DanmuMessage, DanmuMessageParseError> {
    let mut result = DanmuMessage::empty();

    if let Some(cmd) = raw["cmd"].as_str() {
      if !cmd.starts_with("DANMU_MSG") {
        return Err(DanmuMessageParseError::WrongCommandType(cmd.to_string()));
      }
      if !cmd.eq("DANMU_MSG") {
        result.is_special_type = true;
      }
    } else {
      return Err(DanmuMessageParseError::UnableGetCommandType);
    }

    let info = &raw["info"];

    result.parse_meta(&info[0]);
    result.content = info[1].as_str().unwrap_or("").to_string();
    result.parse_user_data(&info[2]);
    result.medal_info = MedalInfo::from_raw(&info[3]);
    result.parse_level_info(&info[4]);
    result.parse_title_info(&info[5]);

    Ok(result)
  }

  fn parse_meta(&mut self, meta: &Value) {
    self.fontsize = meta[2].as_i64().unwrap_or(0) as i32;
    self.color = meta[3].as_i64().unwrap_or(0) as i32;
    self.timestamp = meta[4].as_u64().unwrap_or(0);
    self.danmu_type = DanmuType::from_u32(meta[12].as_u64().unwrap_or(0) as u32);
    self.emoji_data = EmojiData::from_raw(&meta[13]);
  }

  fn parse_user_data(&mut self, user_data: &Value) {
    self.uid = user_data[0].as_u64().unwrap_or(0);
    self.u_name = user_data[1].as_str().unwrap_or("[CDT-Default]").to_string();
    self.is_manager = !user_data[2].as_u64().unwrap_or(0) == 0;
    self.is_vip = !user_data[3].as_u64().unwrap_or(0) == 0;
    self.is_svip = !user_data[4].as_u64().unwrap_or(0) == 0;
  }

  fn parse_level_info(&mut self, level_info: &Value) {
    self.user_ul = level_info[0].as_i64().unwrap_or(0) as i32;
  }

  fn parse_title_info(&mut self, title_info: &Value) {
    self.user_title = title_info[0].as_str().unwrap_or("").to_string();
  }
}

#[derive(thiserror::Error, Debug)]
pub enum DanmuMessageParseError {
  #[error("failed to get command type(cmd field)")]
  UnableGetCommandType,
  #[error("unexpected command type: {0}")]
  WrongCommandType(String),
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/danmuMessage/"
)]
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
