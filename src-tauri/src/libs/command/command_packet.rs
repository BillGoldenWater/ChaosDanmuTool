/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::config::config::serialize_config;

pub mod app_command;
pub mod bilibili_command;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(export, export_to = "../src/share/type/rust/command/")]
pub enum CommandPacket {
  AppCommand { data: AppCommand },
  BiliBiliCommand { data: BiliBiliCommand },
}

impl CommandPacket {
  pub fn from_app_command(command: AppCommand) -> CommandPacket {
    CommandPacket::AppCommand { data: command }
  }

  pub fn from_bilibili_command(command: BiliBiliCommand) -> CommandPacket {
    CommandPacket::BiliBiliCommand { data: command }
  }

  pub fn to_string(&self) -> Result<String, serde_json::Error> {
    match self {
      CommandPacket::AppCommand { data: app_command } => {
        match app_command {
          AppCommand::ConfigUpdate { .. } => { Ok(serialize_config(self, false)) }
          _ => Ok(serde_json::to_string(self)?)
        }
      }
      _ => Ok(serde_json::to_string(self)?)
    }
  }
}