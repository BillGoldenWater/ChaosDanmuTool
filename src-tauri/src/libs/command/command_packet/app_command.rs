/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::libs::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::libs::command::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use crate::libs::command::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use crate::libs::command::command_packet::app_command::user_info_update::UserInfoUpdate;
use crate::libs::command::command_packet::app_command::viewer_status_update::ViewerStatusUpdate;

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
  pub fn from_bilibili_packet_parse_error(
    bilibili_packet_parse_error: BiliBiliPacketParseError,
  ) -> Self {
    Self::BiliBiliPacketParseError {
      data: bilibili_packet_parse_error,
    }
  }

  pub fn from_config_update(config_update: ConfigUpdate) -> Self {
    Self::ConfigUpdate {
      data: Box::from(config_update),
    }
  }

  pub fn from_gift_config_update(gift_config_update: GiftConfigUpdate) -> Self {
    Self::GiftConfigUpdate {
      data: gift_config_update,
    }
  }

  pub fn from_receiver_status_update(receiver_status_update: ReceiverStatusUpdate) -> Self {
    Self::ReceiverStatusUpdate {
      data: receiver_status_update,
    }
  }

  pub fn from_user_info_update(user_info_update: UserInfoUpdate) -> Self {
    Self::UserInfoUpdate {
      data: Box::from(user_info_update),
    }
  }

  pub fn from_viewer_status_update(viewer_status_update: ViewerStatusUpdate) -> Self {
    Self::ViewerStatusUpdate {
      data: viewer_status_update,
    }
  }

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
