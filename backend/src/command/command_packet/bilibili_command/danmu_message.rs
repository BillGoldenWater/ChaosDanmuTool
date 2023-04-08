/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;

use log::error;
use static_object::StaticObject;

use crate::cache::user_info_cache::medal_data::{FromRawError, MedalData};
use crate::cache::user_info_cache::user_info::UserInfo;
use crate::cache::user_info_cache::UserInfoCache;
use crate::command::command_packet::bilibili_command::danmu_message::extra::Extra;
use crate::command::command_packet::bilibili_command::FromRawCommand;
use crate::types::bilibili::bilibili_message::danmu_msg::DanmuMsg;
use crate::types::bilibili::emoji_data::EmojiData;
use crate::types::bilibili::emot::Emot;

pub mod extra;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/bilibiliCommand/"
)]
pub struct DanmuMessage {
  fontsize: i32,
  color: i32,
  bubble_color: String,
  /// millisecond
  timestamp: String,
  danmu_type: DanmuType,
  emoji_data: Option<EmojiData>,
  emots: HashMap<String, Emot>,

  content: String,

  uid: String,

  is_history: bool,
  is_special_type: bool,
  count: i32,
}

#[async_trait::async_trait]
impl FromRawCommand<DanmuMsg> for DanmuMessage {
  async fn from_raw_command(raw: DanmuMsg) -> Self
  where
    Self: Sized,
  {
    DanmuMessageParser::from_raw(raw).parse().await
  }
}

impl Default for DanmuMessage {
  fn default() -> Self {
    Self {
      fontsize: 0,
      color: 0,
      bubble_color: String::new(),
      timestamp: String::new(),
      danmu_type: DanmuType::default(),
      emoji_data: None,
      emots: HashMap::new(),
      content: String::new(),
      uid: String::new(),
      is_history: false,
      is_special_type: false,
      count: 1,
    }
  }
}

struct DanmuMessageParser {
  raw: DanmuMsg,
  result: DanmuMessage,
  user_info: UserInfo,
}

impl DanmuMessageParser {
  fn from_raw(raw: DanmuMsg) -> Self {
    Self {
      raw,
      result: Default::default(),
      user_info: Default::default(),
    }
  }

  async fn parse(self) -> DanmuMessage {
    self
      .parse_special()
      .parse_meta()
      .parse_content()
      .parse_user_data()
      .parse_medal()
      .parse_level_info()
      .parse_title_info()
      .finish()
      .await
  }

  fn parse_special(mut self) -> Self {
    self.result.is_special_type = self.raw.is_special;

    self
  }

  fn parse_meta(mut self) -> Self {
    let meta = &self.raw.info[0];

    self.result.fontsize = meta[2].as_i64().unwrap_or(0) as i32;
    self.result.color = meta[3].as_i64().unwrap_or(0) as i32;
    self.result.timestamp = meta[4].as_u64().unwrap_or(0).to_string();
    self.result.bubble_color = parse_bubble_color(meta[11].as_str().unwrap_or(""));
    self.result.danmu_type = DanmuType::from_u32(meta[12].as_u64().unwrap_or(0) as u32);
    if !meta[13].is_string() {
      self.result.emoji_data = EmojiData::from_raw(&meta[13]).map_or_else(
        |err| {
          error!(
            "unable to parse emoji_data \n{data}\n\n{err:?}",
            data = meta[13]
          );
          None
        },
        Some,
      );
    }
    if meta[15]["extra"].is_string() {
      self.result.emots = meta[15]["extra"]
        .as_str()
        .map_or_else(|| Ok(Default::default()), serde_json::from_str::<Extra>)
        .map_or_else(
          |err| {
            error!(
              "unable to parse extra \n{data:?}\n\n{err:?}",
              data = meta[15]["extra"].as_str()
            );
            Default::default()
          },
          |it| it.emots,
        )
        .unwrap_or_default();
    }

    self
  }

  fn parse_content(mut self) -> Self {
    let content = &self.raw.info[1];

    self.result.content = content.as_str().unwrap_or("").to_string();

    self
  }

  fn parse_user_data(mut self) -> Self {
    let user_data = &self.raw.info[2];

    self.user_info.uid = user_data[0].as_u64().unwrap_or(0).to_string();
    self.user_info.name = user_data[1].as_str().map(|it| it.to_string());
    self.user_info.is_manager = user_data[2].as_u64().map(|it| it != 0);
    self.user_info.is_vip = user_data[3].as_u64().map(|it| it != 0);
    self.user_info.is_svip = user_data[4].as_u64().map(|it| it != 0);

    self.result.uid = self.user_info.uid.clone();

    self
  }

  fn parse_medal(mut self) -> Self {
    let medal_data = &self.raw.info[3];

    self.user_info.medal = MedalData::from_danmu_raw(medal_data).map_or_else(
      |err| {
        if err != FromRawError::EmptyInput {
          error!("unable to parse medal \n{medal_data}\n{err:?}");
        }
        None
      },
      Some,
    );

    self
  }

  fn parse_level_info(mut self) -> Self {
    let level_info = &self.raw.info[4];

    self.user_info.user_level = level_info[0].as_u64().map(|it| it as u32);

    self
  }

  fn parse_title_info(mut self) -> Self {
    let title_info = &self.raw.info[5];

    self.user_info.title = title_info[1].as_str().map(|it| it.to_string());

    self
  }

  async fn finish(self) -> DanmuMessage {
    UserInfoCache::i().update(self.user_info).await;

    self.result
  }
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/bilibiliCommand/danmuMessage/"
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

fn parse_bubble_color(raw: &str) -> String {
  if raw.is_empty() {
    String::new()
  } else {
    raw
      .split(',')
      .next()
      .map_or(Some(""), |it| it.strip_prefix('#'))
      .map_or(Ok(u64::MAX), |it| u64::from_str_radix(it, 16))
      .ok()
      .map_or_else(String::new, |it| {
        if it == u64::MAX {
          String::new()
        } else {
          // argb to rgba
          format!("#{:08X}", ((it & 0xFFFFFF) << 8) | (it >> 24))
        }
      })
  }
}

#[cfg(test)]
mod tests {
  use crate::command::command_packet::bilibili_command::danmu_message::parse_bubble_color;

  #[test]
  fn test_parse_empty_bubble_color() {
    assert_eq!("".to_string(), parse_bubble_color(""));
  }

  #[test]
  fn test_parse_unknown_bubble_color() {
    assert_eq!(
      "".to_string(),
      parse_bubble_color("#------,#------,#------")
    );
    assert_eq!(
      "".to_string(),
      parse_bubble_color("12345678,12345678,12345678")
    );
  }

  #[test]
  fn test_parse_correct_bubble_color() {
    assert_eq!("#34567812".to_string(), parse_bubble_color("#12345678"));
    assert_eq!(
      "#34567812".to_string(),
      parse_bubble_color("#12345678,#22345678,#32345678")
    );
  }
}
