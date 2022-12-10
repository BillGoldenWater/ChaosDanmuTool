/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::str::FromStr;

use log::error;
use serde_json::Value;
use static_object::StaticObject;

use crate::cache::user_info_cache::medal_data::{FromRawError, MedalData};
use crate::cache::user_info_cache::user_info::UserInfo;
use crate::cache::user_info_cache::UserInfoCache;
use crate::types::bilibili::emoji_data::EmojiData;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
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
  emoji_data: Option<EmojiData>,

  content: String,

  uid: u64,

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
      danmu_type: DanmuType::default(),
      emoji_data: None,
      content: "".to_string(),
      uid: 0,
      is_history: false,
      is_special_type: false,
      count: 1,
    }
  }

  pub async fn from_raw(raw: &Value) -> Result<DanmuMessage, DanmuMessageParseError> {
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

    let mut user_info = result.parse_user_data(&info[2]);
    result.parse_medal(&info[3], &mut user_info);
    result.parse_level_info(&info[4], &mut user_info);
    result.parse_title_info(&info[5], &mut user_info);
    result.uid = u64::from_str(&user_info.uid).unwrap();
    UserInfoCache::i().update(user_info).await;

    Ok(result)
  }

  fn parse_meta(&mut self, meta: &Value) {
    self.fontsize = meta[2].as_i64().unwrap_or(0) as i32;
    self.color = meta[3].as_i64().unwrap_or(0) as i32;
    self.timestamp = meta[4].as_u64().unwrap_or(0);
    self.danmu_type = DanmuType::from_u32(meta[12].as_u64().unwrap_or(0) as u32);
    if !meta[13].is_string() {
      self.emoji_data = EmojiData::from_raw(&meta[13]).map_or_else(
        |err| {
          error!(
            "unable to parse emoji_data \n{data}\n{err:?}",
            data = meta[13]
          );
          None
        },
        Some,
      );
    }
  }

  fn parse_user_data(&mut self, user_data: &Value) -> UserInfo {
    UserInfo {
      uid: user_data[0].as_u64().unwrap_or(0).to_string(),
      name: user_data[1].as_str().map(|it| it.to_string()),
      is_manager: user_data[2].as_u64().map(|it| it != 0),
      is_vip: user_data[3].as_u64().map(|it| it != 0),
      is_svip: user_data[4].as_u64().map(|it| it != 0),
      ..Default::default()
    }
  }

  fn parse_medal(&mut self, medal_data: &Value, result: &mut UserInfo) {
    result.medal = MedalData::from_raw(medal_data).map_or_else(
      |err| {
        if err != FromRawError::EmptyInput {
          error!("unable to parse medal \n{medal_data}\n{err:?}");
        }
        None
      },
      Some,
    )
  }

  fn parse_level_info(&mut self, level_info: &Value, result: &mut UserInfo) {
    result.user_level = level_info[0].as_u64().map(|it| it as u32)
  }

  fn parse_title_info(&mut self, title_info: &Value, result: &mut UserInfo) {
    result.title = title_info[0].as_str().map(|it| it.to_string())
  }
}

#[derive(thiserror::Error, Debug)]
pub enum DanmuMessageParseError {
  #[error("failed to get command type(cmd field)")]
  UnableGetCommandType,
  #[error("unexpected command type: {0}")]
  WrongCommandType(String),
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/command/commandPacket/bilibiliCommand/danmuMessage/"
)]
pub enum DanmuType {
  #[default]
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
