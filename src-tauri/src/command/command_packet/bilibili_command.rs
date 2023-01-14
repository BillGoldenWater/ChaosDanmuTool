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
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/")]
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
  },
  RawBackup {
    #[ts(type = "unknown")]
    data: Value,
  },
  ParseFailed {
    data: String,
    message: String,
  },
}

impl BiliBiliCommand {
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

  pub fn from_raw(raw: Value) -> BiliBiliCommand {
    BiliBiliCommand::Raw { data: raw }
  }

  pub fn from_raw_backup(raw: Value) -> BiliBiliCommand {
    BiliBiliCommand::RawBackup { data: raw }
  }

  pub fn parse_failed(data: String, message: String) -> BiliBiliCommand {
    BiliBiliCommand::ParseFailed { data, message }
  }

  pub fn command(&self) -> String {
    match self {
      BiliBiliCommand::ActivityUpdate { .. } => "activityUpdate".to_string(),
      BiliBiliCommand::DanmuMessage { .. } => "danmuMessage".to_string(),
      BiliBiliCommand::Raw { data } => {
        format!("raw.{cmd}", cmd = data["cmd"].as_str().unwrap_or("unknown"))
      }
      BiliBiliCommand::RawBackup { data } => {
        format!(
          "rawBackup.{cmd}",
          cmd = data["cmd"].as_str().unwrap_or("unknown")
        )
      }
      BiliBiliCommand::ParseFailed { .. } => "parseFailed".to_string(),
    }
  }
}
