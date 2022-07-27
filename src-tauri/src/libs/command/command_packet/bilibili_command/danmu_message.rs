/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::{Map, Value};

use crate::error;
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

  pub fn from_raw(raw: Value) -> Result<DanmuMessage, DanmuMessageParseError> {
    let raw_dm = match raw {
      Value::Object(obj) => Ok(obj),
      _ => Err(DanmuMessageParseError::UnknownRawData)
    }?;

    let mut result = DanmuMessage::empty();

    if let Some(cmd) = raw_dm.get("cmd") {
      if let Value::String(cmd) = cmd {
        if !cmd.starts_with("DANMU_MSG") {
          return Err(DanmuMessageParseError::WrongCommandType(cmd.to_string()));
        }
        if !cmd.eq("DANMU_MSG") {
          result.is_special_type = true;
        }
      } else {
        return Err(DanmuMessageParseError::WrongCommandTypeFieldType);
      }
    } else {
      return Err(DanmuMessageParseError::UnableGetCommandType);
    }

    if raw_dm.get("info").is_none() {
      return Err(DanmuMessageParseError::UnableGetInfo);
    }
    let info = match raw_dm.get("info").unwrap() {
      Value::Array(arr) => Ok(arr),
      _ => Err(DanmuMessageParseError::WrongInfoFieldType)
    }?;

    if let Some(meta) = info.get(0) {
      result.parse_meta(meta)
    }

    if let Some(content) = info.get(1) {
      result.content = content.as_str().unwrap_or("").to_string();
    }

    if let Some(user_data) = info.get(2) {
      result.parse_user_data(user_data);
    }

    if let Some(raw_medal) = info.get(3) {
      result.medal_info = MedalInfo::from_raw(raw_medal);
    }

    if let Some(level_info) = info.get(4) {
      result.parse_level_info(level_info);
    }

    if let Some(title_info) = info.get(5) {
      result.parse_title_info(title_info);
    }

    Ok(result)
  }

  fn parse_meta(&mut self, meta: &Value) {
    let meta = match meta {
      Value::Array(arr) => arr,
      _ => return
    };

    self.fontsize =
      meta.get(2).unwrap_or(&Value::Null).as_i64().unwrap_or(0) as i32;
    self.color =
      meta.get(3).unwrap_or(&Value::Null).as_i64().unwrap_or(0) as i32;
    self.timestamp =
      meta.get(4).unwrap_or(&Value::Null).as_u64().unwrap_or(0);
    self.danmu_type =
      DanmuType::from_u32(
        meta.get(12).unwrap_or(&Value::Null).as_u64().unwrap_or(0) as u32
      );

    let emoji_parse_result = EmojiData::parse(
      &serde_json::to_string(
        meta.get(13).unwrap_or(&Value::Null).as_object()
          .unwrap_or(&Map::new())
      ).unwrap_or("{}".to_string())
    );

    if emoji_parse_result.is_err() {
      error!("failed to parse emoji data {:?}", emoji_parse_result);
    }

    self.emoji_data = emoji_parse_result.unwrap_or(EmojiData::empty());
  }

  fn parse_user_data(&mut self, user_data: &Value) {
    let user_data = match user_data {
      Value::Array(arr) => arr,
      _ => return
    };

    self.uid = user_data.get(0).unwrap_or(&Value::Null).as_u64().unwrap_or(0);
    self.u_name = user_data.get(1).unwrap_or(&Value::Null)
      .as_str().unwrap_or("[CDT-Default]").to_string();
    self.is_manager = !user_data.get(2).unwrap_or(&Value::Null)
      .as_u64().unwrap_or(0).eq(&0);
    self.is_vip = !user_data.get(3).unwrap_or(&Value::Null)
      .as_u64().unwrap_or(0).eq(&0);
    self.is_svip = !user_data.get(4).unwrap_or(&Value::Null)
      .as_u64().unwrap_or(0).eq(&0);
  }

  fn parse_level_info(&mut self, level_info: &Value) {
    let level_info = match level_info {
      Value::Array(arr) => arr,
      _ => return
    };

    self.user_ul = level_info.get(0).unwrap_or(&Value::Null)
      .as_i64().unwrap_or(0) as i32;
  }

  fn parse_title_info(&mut self, title_info: &Value) {
    let title_info = match title_info {
      Value::Array(arr) => arr,
      _ => return
    };

    self.user_title = title_info.get(0).unwrap_or(&Value::Null)
      .as_str().unwrap_or("").to_string();
  }
}

#[derive(Debug)]
pub enum DanmuMessageParseError {
  UnknownRawData,
  UnableGetCommandType,
  WrongCommandTypeFieldType,
  WrongCommandType(String),
  UnableGetInfo,
  WrongInfoFieldType,
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