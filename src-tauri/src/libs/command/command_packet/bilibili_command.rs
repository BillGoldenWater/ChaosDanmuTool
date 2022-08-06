/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::libs::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::libs::command::command_packet::bilibili_command::danmu_message::DanmuMessage;

pub mod activity_update;
pub mod danmu_message;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/")]
pub enum BiliBiliCommand {
  ActivityUpdate {
    data: ActivityUpdate,
  },
  DanmuMessage {
    data: DanmuMessage,
  },
  Raw {
    #[ts(type = "unknown")]
    data: Value,
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
      data: danmu_message,
    }
  }

  pub fn from_raw(raw: Value) -> BiliBiliCommand {
    BiliBiliCommand::Raw { data: raw }
  }
}
