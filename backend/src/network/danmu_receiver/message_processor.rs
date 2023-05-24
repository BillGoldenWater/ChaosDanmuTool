/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;

use log::{error, warn};
use serde::Deserialize;
use serde_json::Value;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;

use chaos_danmu_tool_share::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use chaos_danmu_tool_share::command_packet::bilibili_command::activity_update::ActivityUpdate;
use chaos_danmu_tool_share::command_packet::bilibili_command::BiliBiliCommand;
use chaos_danmu_tool_share::command_packet::CommandPacket;
use chaos_danmu_tool_share::types::bilibili::bilibili_message::BiliBiliMessage;
use chaos_danmu_tool_share::types::user_info::UserInfo;

use crate::app_context::AppContext;
use crate::b_get;
use crate::network::danmu_receiver::data_type::DataType;
use crate::network::danmu_receiver::op_code::OpCode;
use crate::network::danmu_receiver::packet::Packet;
use crate::utils::bytes_utils::bytes_to_hex;

#[derive(Default)]
pub struct MessageProcessor {
  pub user_infos: Vec<UserInfo>,
  pub commands: Vec<CommandPacket>,
  pub heartbeat_received: bool,

  pub connection_closed: Option<bool>, // Some for closed, Some(true) for closed Abnormally and require reconnect
}

impl MessageProcessor {
  pub fn process(&mut self, messages: Vec<Message>) {
    for message in messages {
      self.process_msg(message);
    }
  }

  fn process_msg(&mut self, message: Message) {
    match message {
      Message::Binary(data) => self.process_packets(Packet::parse_bytes(&data.as_slice())),
      Message::Close(close_frame) => {
        let close_frame = close_frame.unwrap_or(CloseFrame {
          code: CloseCode::Normal,
          reason: Cow::Borrowed(""),
        });

        if close_frame.code == CloseCode::Abnormal {
          warn!("receiver disconnected abnormally, {close_frame:?}");
          self.connection_closed = Some(true);
        } else {
          self.connection_closed = Some(false);
        }
      }
      Message::Ping(..) | Message::Pong(..) | Message::Frame(..) => {}
      Message::Text(text) => warn!("unexpected text message: {:?}", text),
    }
  }

  fn process_packets(&mut self, packets: Vec<Packet>) {
    for packet in packets {
      self.parse_packet(packet)
    }
  }

  fn parse_packet(&mut self, packet: Packet) {
    match packet.op_code {
      OpCode::JoinResponse => {}
      OpCode::HeartbeatResponse => self.parse_heartbeat_response(packet),
      OpCode::Message => self.parse_danmu_message(packet),
      _ => self.push_parse_error(format!("unexpected op_code: {:?}", packet.op_code)),
    }
  }

  fn parse_heartbeat_response(&mut self, packet: Packet) {
    if packet.data_type != DataType::HeartbeatOrJoin {
      self.push_parse_error(format!(
        "unexpect data_type {:?} when OpCode::HeartbeatResponse",
        packet.data_type
      ));
    }

    self.heartbeat_received = true;

    let mut offset = 0;
    let activity = b_get!(@u32, packet.body, offset);
    self.commands.push(ActivityUpdate::new(activity).into())
  }

  fn parse_danmu_message(&mut self, packet: Packet) {
    // region check data type
    if packet.data_type != DataType::Json {
      self.push_parse_error(format!(
        "unexpect data_type {:?} when OpCode::Message",
        packet.data_type
      ));
      return;
    }
    // endregion

    // region parse to json object
    let msg_str = String::from_utf8_lossy(packet.body.as_ref());

    let raw = match serde_json::from_str::<Value>(&msg_str) {
      Ok(raw) => raw,
      Err(err) => {
        self.push_parse_error(format!(
          "unable to parse json string\n{err}\n{msg_str}\n{hex}",
          hex = bytes_to_hex(&packet.body.as_slice())
        ));
        return;
      }
    };
    // endregion

    let bilibili_message = match BiliBiliMessage::deserialize(&raw) {
      Ok(bilibili_message) => bilibili_message,
      Err(err) => {
        self.push_parse_error(format!(
          "unable to parse json object into BilibiliMessage\n\n{err}\n\n{raw:?}"
        ));
        return;
      }
    };

    let cmd_with_user_info = BiliBiliCommand::from_bilibili_message(bilibili_message);
    let cmd = cmd_with_user_info.item;
    if let Some(user_info) = cmd_with_user_info.user_info {
      self.user_infos.push(user_info)
    }
    if AppContext::i().args.store_raw_msg {
      match cmd {
        BiliBiliCommand::Raw { .. } | BiliBiliCommand::ParseFailed { .. } => {
          self.commands.push(cmd.into());
        }
        _ => {
          self.commands.push(cmd.into());
          self.commands.push(BiliBiliCommand::new_raw(raw).into())
        }
      }
    } else {
      match cmd {
        BiliBiliCommand::Raw { .. } => {}
        _ => {
          self.commands.push(cmd.into());
        }
      }
    }
  }

  fn push_parse_error(&mut self, message: String) {
    error!("{}", message);
    self
      .commands
      .push(BiliBiliPacketParseError::new(message).into())
  }
}
