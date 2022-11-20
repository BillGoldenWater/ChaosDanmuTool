/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::str::FromStr;
use std::time::Instant;

use bytes::{Buf, BytesMut};
use log::{error, info, warn};
use serde_json::Value;
use static_object::StaticObject;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;

use crate::get_cfg;
use crate::libs::command::command_history_manager::CommandHistoryManager;
use crate::libs::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::libs::command::command_packet::app_command::receiver_status_update::{
  ReceiverStatus, ReceiverStatusUpdate,
};
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::libs::command::command_packet::bilibili_command::danmu_message::{
  DanmuMessage, DanmuMessageParseError,
};
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::config::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;
use crate::libs::config::config_manager::{modify_cfg, ConfigManager};
use crate::libs::network::api_request::danmu_server_info_getter::{self, DanmuServerInfoGetter};
use crate::libs::network::api_request::room_info_getter::{self, RoomInfoGetter};
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::network::danmu_receiver::danmu_receiver::ConnectError::{
  FailedToConnect, FailedToGetServerInfo,
};
use crate::libs::network::danmu_receiver::data_type::DataType;
use crate::libs::network::danmu_receiver::op_code::OpCode;
use crate::libs::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::libs::network::websocket::websocket_connection::WebSocketConnectError;
use crate::libs::network::websocket::websocket_connection_reusable::WebSocketConnectionReusable;
use crate::libs::utils::immutable_utils::Immutable;
use crate::libs::utils::mut_bytes_utils::bytes_to_hex;
use crate::libs::utils::trace_utils::print_trace;
use crate::libs::utils::ws_utils::close_frame;

type Url = String;
type Token = String;

#[derive(StaticObject)]
pub struct DanmuReceiver {
  ws: WebSocketConnectionReusable,
  status: ReceiverStatus,

  // status
  connected_data: StatusConnectedData,
  reconnect_count: u8,
}

impl DanmuReceiver {
  fn new() -> DanmuReceiver {
    DanmuReceiver {
      ws: WebSocketConnectionReusable::new(),
      status: ReceiverStatus::Close,

      connected_data: StatusConnectedData::default(),
      reconnect_count: 0,
    }
  }

  pub async fn connect_to(&mut self, roomid: u32) {
    #[cfg(not(debug_assertions))]
    {
      warn!("this shouldn't be call in release build");
      print_trace()
    }
    modify_cfg(|cfg| (*cfg).backend.danmu_receiver.roomid = roomid, false).await;
    let result = self.connect().await;
    info!("{result:?}");
  }

  pub async fn connect(&mut self) -> ConnectResult<()> {
    self.set_status(ReceiverStatus::Connecting).await;
    info!("connecting");

    // region get roomid
    let roomid = self.get_actual_room_id().await?;
    self.check_interrupt()?;
    // endregion

    // region get server info
    let (token, url) = self.get_token_and_url(roomid).await?;
    self.check_interrupt()?;
    // endregion

    // region connect
    self.ws.disconnect(close_frame(CloseCode::Normal, "")).await;
    let connect_result = self.ws.connect(url.as_str()).await;

    if let Err(err) = connect_result {
      self.on_error("failed to connect").await;
      return Err(FailedToConnect(err));
    } else {
      // on open
      self
        .ws
        .send(Message::Binary(
          Packet::join(JoinPacketInfo {
            roomid,
            protover: 3,
            platform: "web".to_string(),
            key: token,
          })
          .pack()
          .to_vec(),
        ))
        .await;

      self.reconnect_count = 0;
    }
    // endregion

    self.set_status(ReceiverStatus::Connected).await;
    info!("room {} connected", roomid);
    Ok(())
  }

  #[inline]
  async fn get_actual_room_id(&mut self) -> ConnectResult<u32> {
    let cfg = self.fetch_config().await;

    let roomid = cfg.roomid;
    let cache_prefix = &format!("{}|", roomid);

    // try get in cache
    let cached = cfg.actual_roomid_cache.trim_start_matches(cache_prefix);
    if let Ok(roomid) = u32::from_str(cached) {
      return Ok(roomid);
    }

    // try get online
    let roomid_result = RoomInfoGetter::get_actual_room_id(roomid).await;
    if let Ok(roomid) = roomid_result {
      modify_cfg(
        |cfg| (*cfg).backend.danmu_receiver.actual_roomid_cache = format!("{cache_prefix}{roomid}"),
        true,
      )
      .await;

      return Ok(roomid);
    }

    // err
    self.on_error("failed to get actual roomid").await;
    Err(ConnectError::FailedToGetActualRoomid(
      roomid_result.unwrap_err(),
    ))
  }

  #[inline]
  async fn get_token_and_url(&mut self, roomid: u32) -> ConnectResult<(Token, Url)> {
    let token_and_url_result = DanmuServerInfoGetter::get_token_and_url(roomid).await;

    if token_and_url_result.is_err() {
      self.on_error("failed to get server info").await;
      return Err(FailedToGetServerInfo(token_and_url_result.unwrap_err()));
    }

    let token_and_url = token_and_url_result.unwrap();

    Ok((token_and_url.token, token_and_url.url))
  }

  #[inline]
  fn check_interrupt(&self) -> ConnectResult<()> {
    if self.status == ReceiverStatus::Interrupted {
      Err(ConnectError::ConnectionInterrupted)
    } else {
      Ok(())
    }
  }

  pub async fn disconnect(&mut self) {
    match self.status {
      ReceiverStatus::Close | ReceiverStatus::Interrupted | ReceiverStatus::Error => {
        warn!("already closed");
      }
      ReceiverStatus::Connected => {
        info!("disconnecting");
        self.ws.disconnect(close_frame(CloseCode::Normal, "")).await;
        self.set_status(ReceiverStatus::Close).await;
        info!("disconnected");
      }
      ReceiverStatus::Connecting | ReceiverStatus::Reconnecting => {
        info!("interrupting");
        self.set_status(ReceiverStatus::Interrupted).await;
      }
    }
  }

  pub async fn tick(&mut self) {
    match self.status {
      ReceiverStatus::Close => {}
      ReceiverStatus::Connecting => {}
      ReceiverStatus::Connected => {
        // region recv message
        let messages = self.ws.tick().await;

        for msg in messages {
          self.on_message(msg).await;
        }
        // endregion

        if !self.ws.is_connected() && self.status == ReceiverStatus::Connected {
          self.on_error("unknown disconnect").await;
          return;
        }

        self.tick_heartbeat().await;
      }
      ReceiverStatus::Error => {
        // region tick reconnect
        let cfg = self.fetch_config().await;
        if cfg.auto_reconnect && self.reconnect_count < 5 {
          self.set_status(ReceiverStatus::Reconnecting).await;
        } else {
          self.set_status(ReceiverStatus::Close).await;
        }
        // endregion
      }
      ReceiverStatus::Reconnecting => {
        self.reconnect_count += 1;
        info!("reconnecting (count: {})", self.reconnect_count);
        let result = self.connect().await;
        if let Err(err) = result {
          error!("unable to reconnect: {:?}", err);
        }
      }
      ReceiverStatus::Interrupted => {
        self.on_disconnect(false).await;
      }
    }
  }

  #[inline]
  async fn tick_heartbeat(&mut self) {
    let elapsed = self.connected_data.last_heartbeat_ts.elapsed().as_secs();
    let cfg = self.fetch_config().await;

    if !self.connected_data.heartbeat_received && elapsed > 5 {
      error!("heartbeat timeout");
      self.disconnect().await;
      return;
    }

    if elapsed > cfg.heartbeat_interval as u64 && self.connected_data.heartbeat_received {
      self
        .ws
        .send(Message::Binary(Packet::heartbeat().pack().to_vec()))
        .await;

      self.connected_data.last_heartbeat_ts = Instant::now();
      self.connected_data.heartbeat_received = false;
    }
  }

  pub fn is_connected(&self) -> bool {
    self.ws.is_connected()
  }

  pub fn get_status(&self) -> ReceiverStatus {
    self.status.clone()
  }

  async fn fetch_config(&mut self) -> Immutable<DanmuReceiverConfig> {
    let cfg = get_cfg!().backend.danmu_receiver.clone();
    Immutable::new(cfg)
  }

  async fn set_status(&mut self, status: ReceiverStatus) {
    // reset data
    if let ReceiverStatus::Connected = status {
      self.connected_data = StatusConnectedData::default()
    }

    CommandBroadcastServer::i()
      .broadcast_app_command(AppCommand::from_receiver_status_update(
        ReceiverStatusUpdate::new(status.clone()),
      ))
      .await;

    self.status = status;
  }

  async fn on_message(&mut self, message: Message) {
    match message {
      Message::Binary(data) => {
        let packets = Packet::from_bytes(&mut BytesMut::from(data.as_slice()));

        for packet in packets {
          self.parse_packet(packet).await;
        }
      }
      Message::Close(close_frame) => {
        let close_frame = close_frame.unwrap_or(CloseFrame {
          code: CloseCode::Normal,
          reason: Cow::Owned("".to_string()),
        });

        if close_frame.code == CloseCode::Abnormal {
          self.on_disconnect(true).await;
        } else {
          self.on_disconnect(false).await;
        }
      }
      Message::Ping(..) | Message::Pong(..) | Message::Frame(..) => {}
      _ => {
        info!("{:?}", message)
      }
    }
  }

  #[inline]
  async fn on_error(&mut self, msg: &str) {
    self.set_status(ReceiverStatus::Error).await;
    error!("{msg}");
    print_trace()
  }

  async fn on_disconnect(&mut self, error: bool) {
    self
      .set_status(if error {
        ReceiverStatus::Error
      } else {
        ReceiverStatus::Close
      })
      .await
  }

  async fn parse_packet(&mut self, mut packet: Packet) {
    match packet.op_code {
      OpCode::JoinResponse => {}
      OpCode::HeartbeatResponse => {
        if packet.data_type != DataType::HeartbeatOrJoin {
          let message = format!(
            "unexpect data_type when OpCode::HeartbeatResponse, {:?}",
            packet.data_type
          );
          Self::on_parse_error(message).await;
          return;
        }

        self.connected_data.heartbeat_received = true;

        let activity = packet.body.get_u32();
        CommandBroadcastServer::i()
          .broadcast_bilibili_command(BiliBiliCommand::from_activity_update(ActivityUpdate::new(
            activity,
          )))
          .await;
      }
      OpCode::Message => {
        if packet.data_type != DataType::Json {
          let message = format!(
            "unexpect data_type when OpCode::Message, {:?}",
            packet.data_type
          );
          Self::on_parse_error(message).await;
          return;
        }
        // region parse to string
        let str_parse_result = std::str::from_utf8(packet.body.as_ref());
        if let Ok(str) = str_parse_result {
          // region parse to json object
          let json_parse_result = serde_json::from_str::<Value>(str);
          if let Ok(raw) = json_parse_result {
            // region parse to bilibili command
            let cmd_parse_result = Self::parse_raw(raw.clone()).await;
            if let Ok(command) = cmd_parse_result {
              CommandBroadcastServer::i()
                .broadcast_bilibili_command(command.0)
                .await;

              if let Some(raw_backup) = command.1 {
                let result =
                  write_bilibili_command(BiliBiliCommand::from_raw_backup(raw_backup)).await;

                if let Err(err) = result {
                  error!("unable to write raw_backup\n {err:?}")
                }
              }
            } else {
              // on failed
              let msg = format!(
                "failed when parse json object: {err}",
                err = cmd_parse_result.unwrap_err()
              );
              error!("{msg}");

              let result =
                write_bilibili_command(BiliBiliCommand::parse_failed(str.to_string(), msg)).await;

              if let Err(err) = result {
                error!("unable to write json object parse failed command\n {err:?}")
              }
            }
            // endregion
          } else {
            let msg = format!(
              "unable to parse json string\n {err}\n {str}",
              err = json_parse_result.unwrap_err()
            );
            error!("{msg}");

            let result =
              write_bilibili_command(BiliBiliCommand::parse_failed(str.to_string(), msg)).await;

            if let Err(err) = result {
              error!("unable to write json string parse failed command\n {err:?}")
            }
          }
          // endregion
        } else {
          let data_str = bytes_to_hex(&packet.body);
          let msg = format!(
            "unable to decode message to utf8\n{err}\n{data_str}",
            err = str_parse_result.unwrap_err()
          );
          error!("{msg}");

          let result = write_bilibili_command(BiliBiliCommand::parse_failed(data_str, msg)).await;

          if let Err(err) = result {
            error!("unable to write hex parse failed command\n {err:?}")
          }
        }
        // endregion
      }
      _ => {
        let message = format!("unexpected op_code: {:?}", packet.op_code);
        Self::on_parse_error(message).await
      }
    }
  }

  ///
  /// returns: (BiliBiliCommand, Option<Value>) second is raw for backup if needed
  ///
  pub async fn parse_raw(
    raw: Value,
  ) -> Result<(BiliBiliCommand, Option<Value>), DanmuMessageParseError> {
    let cmd = raw["cmd"].as_str().unwrap_or("");

    if cmd.starts_with("DANMU_MSG") {
      let dm = DanmuMessage::from_raw(&raw).await?;
      Ok((BiliBiliCommand::from_danmu_message(dm), Some(raw)))
    } else {
      Ok((BiliBiliCommand::from_raw(raw), None))
    }
  }

  async fn on_parse_error(message: String) {
    error!("{}", message);
    CommandBroadcastServer::i()
      .broadcast_app_command(AppCommand::from_bilibili_packet_parse_error(
        BiliBiliPacketParseError::new(message),
      ))
      .await
  }
}

async fn write_bilibili_command(
  command: BiliBiliCommand,
) -> crate::libs::command::command_history_manager::Result<()> {
  CommandHistoryManager::i()
    .write(&CommandPacket::from_bilibili_command(command))
    .await
}

pub type ConnectResult<T> = Result<T, ConnectError>;

#[derive(thiserror::Error, Debug)]
pub enum ConnectError {
  #[error("failed to get actual roomid")]
  FailedToGetActualRoomid(#[from] room_info_getter::Error),
  #[error("failed to get server info")]
  FailedToGetServerInfo(#[from] danmu_server_info_getter::Error),
  #[error("failed to connect")]
  FailedToConnect(#[from] WebSocketConnectError),
  #[error("connection interrupted")]
  ConnectionInterrupted,
}

struct StatusConnectedData {
  last_heartbeat_ts: Instant,
  heartbeat_received: bool,
}

impl Default for StatusConnectedData {
  fn default() -> Self {
    Self {
      last_heartbeat_ts: Instant::now(),
      heartbeat_received: true,
    }
  }
}
