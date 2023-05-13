/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;

use base64::Engine;
use log::error;
use quick_protobuf::{BytesReader, MessageRead};

use crate::command_packet::bilibili_command::danmu_message::extra::Extra;
use crate::command_packet::bilibili_command::danmu_message::protobuf::dm_v2::DMv2;
use crate::command_packet::bilibili_command::{FromRawCommand, ItemWithUserInfo};
use crate::types::bilibili::bilibili_message::danmu_msg::DanmuMsg;
use crate::types::bilibili::emoji_data::EmojiData;
use crate::types::bilibili::emot::Emot;
use crate::types::user_info::medal_data::{FromRawError, MedalData};
use crate::types::user_info::UserInfo;

pub mod extra;
pub mod protobuf;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
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

impl FromRawCommand<DanmuMsg> for DanmuMessage {
  fn from_raw_command(raw: DanmuMsg) -> ItemWithUserInfo<Self> {
    DanmuMessageParser::from_raw(raw).parse()
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

  fn parse(self) -> ItemWithUserInfo<DanmuMessage> {
    self
      .parse_special()
      .parse_v2()
      .parse_meta()
      .parse_content()
      .parse_user_data()
      .parse_medal()
      .parse_level_info()
      .parse_title_info()
      .finish()
  }

  fn parse_special(mut self) -> Self {
    self.result.is_special_type = self.raw.is_special;

    self
  }

  #[allow(unreachable_code, unused_mut)]
  fn parse_v2(mut self) -> Self {
    return self; // todo: disabled due to high frequency request to bilibili server may cause some issue.

    // try decode base64
    let dm_v2 = self.raw.dm_v2.as_ref().and_then(|dm_v2| {
      base64::engine::general_purpose::STANDARD
        .decode(dm_v2)
        .map_err(|err| error!("failed to parse dm_v2(base64): {:?}\n{}", err, dm_v2))
        .ok()
    });

    // try parse protobuf
    if let Some(dm_v2) = &dm_v2 {
      let mut reader = BytesReader::from_bytes(dm_v2);
      let dm_v2 = DMv2::from_reader(&mut reader, dm_v2);

      match dm_v2 {
        Ok(dm_v2) => {
          if let Some(user_info) = dm_v2.user_info {
            if let Some(face) = user_info.face {
              self.user_info.face = Some(face.to_string())
            }
          }
        }
        Err(err) => {
          error!(
            "failed to parse dm_v2(protobuf): {:?}\n{:?}",
            err, self.raw.dm_v2
          );
        }
      }
    }
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
        .unwrap_or_default()
        .into_iter()
        .map(|(k, v)| (k, v.to_https()))
        .collect();
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

  fn finish(self) -> ItemWithUserInfo<DanmuMessage> {
    ItemWithUserInfo::new(self.result, self.user_info)
  }
}

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
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
  use crate::command_packet::bilibili_command::danmu_message::parse_bubble_color;

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
