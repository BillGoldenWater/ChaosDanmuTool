/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chrono::{DateTime, TimeZone, Utc};

use crate::command::command_packet::app_command::AppCommand;
use crate::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::config::config::serialize_config;
use crate::utils::brotli_utils::{self, brotli_compress_str};

pub mod app_command;
pub mod bilibili_command;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(export, export_to = "../src/share/type/rust/command/")]
pub enum CommandPacket {
  AppCommand {
    uuid: String,
    timestamp: i64,
    data: AppCommand,
  },
  BiliBiliCommand {
    uuid: String,
    timestamp: i64,
    data: BiliBiliCommand,
  },
}

impl CommandPacket {
  pub fn to_string(&self) -> Result<String> {
    match self {
      CommandPacket::AppCommand {
        data: AppCommand::ConfigUpdate { .. },
        ..
      } => Ok(serialize_config(self, false)),
      _ => Ok(serde_json::to_string(self)?),
    }
  }

  pub fn compressed_base64(&self) -> Result<String> {
    Ok(brotli_compress_str(self.to_string()?)?)
  }

  pub fn command(&self) -> String {
    match self {
      CommandPacket::AppCommand { data, .. } => format!("appCommand.{cmd}", cmd = data.command()),
      CommandPacket::BiliBiliCommand { data, .. } => {
        format!("bilibiliCommand.{cmd}", cmd = data.command())
      }
    }
  }

  pub fn timestamp(&self) -> DateTime<Utc> {
    Utc
      .timestamp_millis_opt(*match self {
        CommandPacket::AppCommand { timestamp, .. } => timestamp,
        CommandPacket::BiliBiliCommand { timestamp, .. } => timestamp,
      })
      .unwrap()
  }
}

impl From<AppCommand> for CommandPacket {
  fn from(value: AppCommand) -> Self {
    Self::AppCommand {
      uuid: uuid::Uuid::new_v4().to_string(),
      timestamp: Utc::now().timestamp_millis(),
      data: value,
    }
  }
}

impl From<BiliBiliCommand> for CommandPacket {
  fn from(value: BiliBiliCommand) -> Self {
    CommandPacket::BiliBiliCommand {
      uuid: uuid::Uuid::new_v4().to_string(),
      timestamp: Utc::now().timestamp_millis(),
      data: value,
    }
  }
}

impl TryFrom<&str> for CommandPacket {
  type Error = Error;

  fn try_from(value: &str) -> std::result::Result<Self, Self::Error> {
    Ok(serde_json::from_str(value)?)
  }
}

macro_rules! gen {
  ($t:ident; $($name:path),*) => {
    $(
    impl From<$name> for CommandPacket {
      fn from(value: $name) -> Self {
        $t::from(value).into()
      }
    }
    )*
  };
}

macro_rules! gen_app {
    ($($name:path),*) => {
    gen!(AppCommand; $($name),*);
  };
}

macro_rules! gen_bilibili {
    ($($name:path),*) => {
    gen!(BiliBiliCommand; $($name),*);
  };
}

gen_app![
  app_command::bilibili_packet_parse_error::BiliBiliPacketParseError,
  app_command::config_update::ConfigUpdate,
  app_command::gift_config_update::GiftConfigUpdate,
  app_command::receiver_status_update::ReceiverStatusUpdate,
  app_command::user_info_update::UserInfoUpdate,
  app_command::viewer_status_update::ViewerStatusUpdate
];

gen_bilibili![
  bilibili_command::activity_update::ActivityUpdate,
  bilibili_command::danmu_message::DanmuMessage
];

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to encode/decode: {0}")]
  Serde(#[from] serde_json::Error),
  #[error("failed to compress: {0}")]
  FailedToCompress(#[from] brotli_utils::Error),
}
