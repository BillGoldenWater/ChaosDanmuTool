/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::command::command_packet::bilibili_command::danmu_message::DanmuMessage;

pub mod activity_update;
pub mod danmu_message;

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
  Raw {
    #[ts(type = "unknown")]
    data: Value,
    is_backup: bool,
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

  pub fn new_raw(raw: Value, is_backup: bool) -> BiliBiliCommand {
    Self::Raw {
      data: raw,
      is_backup,
    }
  }

  pub fn command(&self) -> String {
    match self {
      Self::ActivityUpdate { .. } => "activityUpdate".to_string(),
      Self::DanmuMessage { .. } => "danmuMessage".to_string(),
      Self::Raw { data, is_backup } => {
        let cmd = data["cmd"].as_str().unwrap_or("unknown");
        if *is_backup {
          format!("rawBackup.{cmd}")
        } else {
          format!("raw.{cmd}")
        }
      }
      Self::ParseFailed { .. } => "parseFailed".to_string(),
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

#[derive(thiserror::Error, Debug)]
pub enum CommandParseError {
  #[error("failed to get command type(cmd field)")]
  UnableGetCommandType,
  #[error("unexpected command type: {0}")]
  WrongCommandType(String),
}

pub type CommandParseResult<T> = Result<T, CommandParseError>;

#[async_trait::async_trait]
pub trait CommandParser {
  async fn check_cmd_type(&mut self, raw: &Value, r#type: &str) -> CommandParseResult<()> {
    if let Some(cmd) = raw["cmd"].as_str() {
      if cmd.eq(r#type) {
        Ok(())
      } else {
        Err(CommandParseError::WrongCommandType(cmd.to_string()))
      }
    } else {
      Err(CommandParseError::UnableGetCommandType)
    }
  }

  async fn from_raw(raw: &Value) -> CommandParseResult<Self>
  where
    Self: Sized;
}
