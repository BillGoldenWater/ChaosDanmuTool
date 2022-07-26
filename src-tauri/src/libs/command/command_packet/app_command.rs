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
