/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::command::command_packet::bilibili_command::danmu_message::DanmuMessage;
use crate::command::command_packet::bilibili_command::gift_message::GiftMessage;
use crate::types::bilibili::bilibili_message::BiliBiliMessage;

pub mod activity_update;
pub mod danmu_message;
pub mod gift_message;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/"
)]
pub enum BiliBiliCommand {
  ActivityUpdate {
    data: ActivityUpdate,
  },

  DanmuMessage {
    data: Box<DanmuMessage>,
  },
  GiftMessage {
    data: GiftMessage,
  },

  Raw {
    #[ts(type = "unknown")]
    data: Value,
  },
  ParseFailed {
    data: String,
    message: String,
  },
}

impl BiliBiliCommand {
  pub fn new_parse_failed(data: String, message: String) -> Self {
    Self::ParseFailed { data, message }
  }

  pub fn new_raw(raw: Value) -> BiliBiliCommand {
    Self::Raw { data: raw }
  }

  pub fn command(&self) -> String {
    match self {
      Self::ActivityUpdate { .. } => "activityUpdate".to_string(),
      Self::DanmuMessage { .. } => "danmuMessage".to_string(),
      Self::GiftMessage { .. } => "giftMessage".to_string(),
      Self::Raw { data } => {
        let cmd = data["cmd"].as_str().unwrap_or("unknown");
        format!("raw.{cmd}")
      }
      Self::ParseFailed { .. } => "parseFailed".to_string(),
    }
  }

  pub async fn from_bilibili_message(bilibili_message: BiliBiliMessage) -> Self {
    match bilibili_message {
      BiliBiliMessage::DanmuMsg(danmu_msg) => {
        Self::from(DanmuMessage::from_raw_command(danmu_msg).await)
      }
      BiliBiliMessage::SendGift(send_gift) => {
        Self::from(GiftMessage::from_raw_command(*send_gift).await)
      }
      BiliBiliMessage::Raw(raw) => Self::new_raw(raw),
    }
  }
}

impl From<ActivityUpdate> for BiliBiliCommand {
  fn from(value: ActivityUpdate) -> Self {
    Self::ActivityUpdate { data: value }
  }
}

impl From<DanmuMessage> for BiliBiliCommand {
  fn from(value: DanmuMessage) -> Self {
    Self::DanmuMessage {
      data: Box::from(value),
    }
  }
}

impl From<GiftMessage> for BiliBiliCommand {
  fn from(value: GiftMessage) -> Self {
    Self::GiftMessage { data: value }
  }
}

pub fn from_activity_update(activity_update: ActivityUpdate) -> BiliBiliCommand {
  BiliBiliCommand::ActivityUpdate {
    data: activity_update,
  }
}

pub fn from_danmu_message(danmu_message: DanmuMessage) -> BiliBiliCommand {
  BiliBiliCommand::DanmuMessage {
    data: Box::new(danmu_message),
  }
}

#[async_trait::async_trait]
pub trait FromRawCommand<T> {
  async fn from_raw_command(raw: T) -> Self
  where
    Self: Sized;
}
