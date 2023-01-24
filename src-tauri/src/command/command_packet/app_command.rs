/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::command::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use crate::command::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use crate::command::command_packet::app_command::user_info_update::UserInfoUpdate;
use crate::command::command_packet::app_command::viewer_status_update::ViewerStatusUpdate;

pub mod bilibili_packet_parse_error;
pub mod config_update;
pub mod gift_config_update;
pub mod receiver_status_update;
pub mod user_info_update;
pub mod viewer_status_update;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "cmd")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/")]
pub enum AppCommand {
  BiliBiliPacketParseError { data: BiliBiliPacketParseError },
  ConfigUpdate { data: Box<ConfigUpdate> },
  GiftConfigUpdate { data: GiftConfigUpdate },
  ReceiverStatusUpdate { data: ReceiverStatusUpdate },
  UserInfoUpdate { data: Box<UserInfoUpdate> },
  ViewerStatusUpdate { data: ViewerStatusUpdate },
}

impl AppCommand {
  pub fn command(&self) -> String {
    match self {
      Self::BiliBiliPacketParseError { .. } => "bilibiliPacketParseError".to_string(),
      Self::ConfigUpdate { .. } => "configUpdate".to_string(),
      Self::GiftConfigUpdate { .. } => "giftConfigUpdate".to_string(),
      Self::ReceiverStatusUpdate { .. } => "receiverStatusUpdate".to_string(),
      Self::UserInfoUpdate { .. } => "userInfoUpdate".to_string(),
      Self::ViewerStatusUpdate { .. } => "viewerStatusUpdate".to_string(),
    }
  }
}

impl From<BiliBiliPacketParseError> for AppCommand {
  fn from(value: BiliBiliPacketParseError) -> Self {
    Self::BiliBiliPacketParseError { data: value }
  }
}

impl From<ConfigUpdate> for AppCommand {
  fn from(value: ConfigUpdate) -> Self {
    Self::ConfigUpdate {
      data: Box::from(value),
    }
  }
}

impl From<GiftConfigUpdate> for AppCommand {
  fn from(value: GiftConfigUpdate) -> Self {
    Self::GiftConfigUpdate { data: value }
  }
}

impl From<ReceiverStatusUpdate> for AppCommand {
  fn from(value: ReceiverStatusUpdate) -> Self {
    Self::ReceiverStatusUpdate { data: value }
  }
}

impl From<UserInfoUpdate> for AppCommand {
  fn from(value: UserInfoUpdate) -> Self {
    Self::UserInfoUpdate {
      data: Box::from(value),
    }
  }
}

impl From<ViewerStatusUpdate> for AppCommand {
  fn from(value: ViewerStatusUpdate) -> Self {
    Self::ViewerStatusUpdate { data: value }
  }
}
