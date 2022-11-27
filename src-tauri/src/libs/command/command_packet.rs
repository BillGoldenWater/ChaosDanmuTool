/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chrono::{DateTime, TimeZone, Utc};

use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::config::config::serialize_config;
use crate::libs::utils::brotli_utils::{self, brotli_compress_str};

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
  pub fn from_app_command(command: AppCommand) -> CommandPacket {
    CommandPacket::AppCommand {
      uuid: uuid::Uuid::new_v4().to_string(),
      timestamp: Utc::now().timestamp_millis(),
      data: command,
    }
  }

  pub fn from_bilibili_command(command: BiliBiliCommand) -> CommandPacket {
    CommandPacket::BiliBiliCommand {
      uuid: uuid::Uuid::new_v4().to_string(),
      timestamp: Utc::now().timestamp_millis(),
      data: command,
    }
  }

  pub fn to_string(&self) -> Result<String> {
    match self {
      CommandPacket::AppCommand {
        data: AppCommand::ConfigUpdate { .. },
        ..
      } => Ok(serialize_config(self, false)),
      _ => Ok(serde_json::to_string(self)?),
    }
  }

  pub fn try_from(value: &str) -> Result<Self> {
    Ok(serde_json::from_str(value)?)
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
    Utc.timestamp_millis_opt(*match self {
      CommandPacket::AppCommand { timestamp, .. } => timestamp,
      CommandPacket::BiliBiliCommand { timestamp, .. } => timestamp,
    }).unwrap()
  }
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to encode/decode: {0}")]
  Serde(#[from] serde_json::Error),
  #[error("failed to compress: {0}")]
  FailedToCompress(#[from] brotli_utils::Error),
}
