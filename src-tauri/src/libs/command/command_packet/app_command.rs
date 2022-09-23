/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::libs::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::libs::command::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use crate::libs::command::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use crate::libs::command::command_packet::app_command::viewer_status_update::ViewerStatusUpdate;

pub mod bilibili_packet_parse_error;
pub mod config_update;
pub mod gift_config_update;
pub mod receiver_status_update;
pub mod viewer_status_update;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/")]
pub enum AppCommand {
  BiliBiliPacketParseError { data: BiliBiliPacketParseError },
  ConfigUpdate { data: ConfigUpdate },
  GiftConfigUpdate { data: GiftConfigUpdate },
  ReceiverStatusUpdate { data: ReceiverStatusUpdate },
  ViewerStatusUpdate { data: ViewerStatusUpdate },
}

impl AppCommand {
  pub fn from_bilibili_packet_parse_error(
    bilibili_packet_parse_error: BiliBiliPacketParseError,
  ) -> AppCommand {
    AppCommand::BiliBiliPacketParseError {
      data: bilibili_packet_parse_error,
    }
  }

  pub fn from_config_update(config_update: ConfigUpdate) -> AppCommand {
    AppCommand::ConfigUpdate {
      data: config_update,
    }
  }

  pub fn from_gift_config_update(gift_config_update: GiftConfigUpdate) -> AppCommand {
    AppCommand::GiftConfigUpdate {
      data: gift_config_update,
    }
  }

  pub fn from_receiver_status_update(receiver_status_update: ReceiverStatusUpdate) -> AppCommand {
    AppCommand::ReceiverStatusUpdate {
      data: receiver_status_update,
    }
  }

  pub fn from_viewer_status_update(viewer_status_update: ViewerStatusUpdate) -> AppCommand {
    AppCommand::ViewerStatusUpdate {
      data: viewer_status_update,
    }
  }

  pub fn command(&self) -> String {
    match self {
      AppCommand::BiliBiliPacketParseError { .. } => "bilibiliPacketParseError".to_string(),
      AppCommand::ConfigUpdate { .. } => "configUpdate".to_string(),
      AppCommand::GiftConfigUpdate { .. } => "giftConfigUpdate".to_string(),
      AppCommand::ReceiverStatusUpdate { .. } => "receiverStatusUpdate".to_string(),
      AppCommand::ViewerStatusUpdate { .. } => "viewerStatusUpdate".to_string(),
    }
  }
}
