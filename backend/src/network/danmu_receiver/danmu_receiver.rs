/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::str::FromStr;
use std::time::Instant;

use log::{error, info, warn};
use serde_json::Value;
use static_object::StaticObject;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;

use crate::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::command::command_packet::app_command::receiver_status_update::{
  ReceiverStatus, ReceiverStatusUpdate,
};
use crate::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::command::command_packet::bilibili_command::danmu_message::DanmuMessage;
use crate::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::command::command_packet::CommandPacket;
use crate::config::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;
use crate::config::config_manager::{modify_cfg, ConfigManager};
use crate::network::api_request::bilibili_response::Error::EmptyData;
use crate::network::api_request::danmu_server_info_getter::{self, DanmuServerInfoGetter};
use crate::network::api_request::room_info_getter::{self, RoomInfoGetter};
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::network::danmu_receiver::danmu_receiver::ConnectError::{
  FailedToConnect, FailedToGetServerInfo, IllegalRoomid,
};
use crate::network::danmu_receiver::data_type::DataType;
use crate::network::danmu_receiver::op_code::OpCode;
use crate::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::network::websocket::websocket_connection::WebSocketConnectError;
use crate::network::websocket::websocket_connection_reusable::WebSocketConnectionReusable;
use crate::utils::bytes_utils::bytes_to_hex;
use crate::utils::immutable_utils::Immutable;
use crate::utils::trace_utils::print_trace;
use crate::utils::ws_utils::close_frame;
use crate::{b_get, get_cfg};

type Url = String;
type Token = String;

#[derive(StaticObject)]
pub struct DanmuReceiver {
  ws: WebSocketConnectionReusable,
  status: ReceiverStatus,

  // status
  connected_data: StatusConnectedData,
  reconnect_count: u8,
  reconnect_time: Instant,
}

impl DanmuReceiver {
  fn new() -> DanmuReceiver {
    DanmuReceiver {
      ws: WebSocketConnectionReusable::new(),
      status: ReceiverStatus::Close,

      connected_data: StatusConnectedData::default(),
      reconnect_count: 0,
      reconnect_time: Instant::now(),
    }
  }

  pub async fn connect_to(&mut self, roomid: u32) {
    #[cfg(not(debug_assertions))]
    {
      warn!("this shouldn't be call in release build");
      print_trace()
    }
    modify_cfg(|cfg| cfg.backend.danmu_receiver.roomid = roomid, false).await;
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
        |cfg| cfg.backend.danmu_receiver.actual_roomid_cache = format!("{cache_prefix}{roomid}"),
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

    if let Err(err) = token_and_url_result {
      if let danmu_server_info_getter::Error::Request(EmptyData(data)) = &err {
        if data.code == Some(1002002) {
          self.set_status(ReceiverStatus::Close).await;
          return Err(IllegalRoomid(roomid));
        }
      }

      self.on_error("failed to get server info").await;

      return Err(FailedToGetServerInfo(err));
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

        let mut commands = vec![];
        for msg in messages {
          self.parse_message(&mut commands, msg).await
        }
        if !commands.is_empty() {
          CommandBroadcastServer::i()
            .broadcast_cmd_many(commands)
            .await;
        }
        // endregion

        if !self.ws.is_connected().await && self.status == ReceiverStatus::Connected {
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
        if self.reconnect_time.elapsed().as_secs() >= 2 {
          self.reconnect_count += 1;
          info!("reconnecting (count: {})", self.reconnect_count);
          let result = self.connect().await;
          if let Err(err) = result {
            error!("unable to reconnect: {:?}", err);
          }
        }
      }
      ReceiverStatus::Interrupted => {
        self.on_disconnect(false).await;
      }
    }
  }

  #[inline]
  async fn tick_heartbeat(&mut self) {
    let tick_elapsed = self
      .connected_data
      .last_heartbeat_tick_ts
      .elapsed()
      .as_secs();
    let elapsed = self.connected_data.last_heartbeat_ts.elapsed().as_secs();
    let cfg = self.fetch_config().await;

    if !self.connected_data.heartbeat_received && (elapsed - tick_elapsed) > 5 {
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

    self.connected_data.last_heartbeat_tick_ts = Instant::now();
  }

  pub async fn is_connected(&self) -> bool {
    self.ws.is_connected().await
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
    if let ReceiverStatus::Reconnecting = status {
      self.reconnect_time = Instant::now()
    }

    CommandBroadcastServer::i()
      .broadcast_cmd(ReceiverStatusUpdate::new(status.clone()).into())
      .await;

    self.status = status;
  }

  /// only should use for errors that not related to user input
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

  // region parse message
  async fn parse_message(&mut self, buf: &mut Vec<CommandPacket>, message: Message) {
    match message {
      Message::Binary(data) => {
        for packet in Packet::parse_bytes(&data.as_slice()) {
          self.parse_packet(buf, packet).await;
        }
      }
      Message::Close(close_frame) => {
        let close_frame = close_frame.unwrap_or(CloseFrame {
          code: CloseCode::Normal,
          reason: Cow::Owned("".to_string()),
        });

        if close_frame.code == CloseCode::Abnormal {
          warn!("receiver disconnected abnormally, {close_frame:?}");
          self.on_disconnect(true).await;
        } else {
          self.on_disconnect(false).await;
        }
      }
      Message::Ping(..) | Message::Pong(..) | Message::Frame(..) => {}
      _ => info!("{:?}", message),
    }
  }

  async fn parse_packet(&mut self, buf: &mut Vec<CommandPacket>, packet: Packet) {
    match packet.op_code {
      OpCode::JoinResponse => {}
      OpCode::HeartbeatResponse => self.parse_heartbeat_response(buf, packet).await,
      OpCode::Message => self.parse_danmu_message(buf, packet).await,
      _ => {
        let message = format!("unexpected op_code: {:?}", packet.op_code);
        self.push_parse_error(buf, message)
      }
    }
  }

  async fn parse_heartbeat_response(&mut self, buf: &mut Vec<CommandPacket>, packet: Packet) {
    if packet.data_type != DataType::HeartbeatOrJoin {
      let message = format!(
        "unexpect data_type {:?} when OpCode::HeartbeatResponse",
        packet.data_type
      );
      self.push_parse_error(buf, message);
    }

    self.connected_data.heartbeat_received = true;

    let mut offset = 0;
    let activity = b_get!(@u32, packet.body, offset);
    buf.push(ActivityUpdate::new(activity).into())
  }

  async fn parse_danmu_message(&mut self, buf: &mut Vec<CommandPacket>, packet: Packet) {
    // region check data type
    if packet.data_type != DataType::Json {
      let message = format!(
        "unexpect data_type {:?} when OpCode::Message",
        packet.data_type
      );
      self.push_parse_error(buf, message);
      return;
    }
    // endregion

    // region parse to json object
    let msg_str = String::from_utf8_lossy(packet.body.as_ref());

    let raw = match serde_json::from_str::<Value>(&msg_str) {
      Ok(raw) => raw,
      Err(err) => {
        let msg = format!(
          "unable to parse json string\n{err}\n{msg_str}\n{hex}",
          hex = bytes_to_hex(&packet.body.as_slice())
        );
        error!("{msg}");
        buf.push(BiliBiliCommand::new_parse_failed(msg_str.to_string(), msg).into());
        return;
      }
    };
    // endregion

    self.parse_raw(buf, raw).await;
  }

  ///
  /// returns: (BiliBiliCommand, Option<Value>) second is raw for backup if needed
  ///
  async fn parse_raw(&mut self, buf: &mut Vec<CommandPacket>, raw: Value) {
    let cmd = raw["cmd"].as_str().unwrap_or("");

    if cmd.starts_with("DANMU_MSG") {
      let dm_result = DanmuMessage::from_raw(&raw).await;

      let dm = match dm_result {
        Ok(dm) => dm,
        Err(err) => {
          let msg = format!("failed to parse danmuMessage\n{err:?}");
          error!("{msg}");
          buf.push(
            BiliBiliCommand::new_parse_failed(serde_json::to_string(&raw).unwrap(), msg).into(),
          );
          return;
        }
      };

      buf.push(BiliBiliCommand::from(dm).into());
      buf.push(BiliBiliCommand::new_raw(raw, true).into());
    } else {
      buf.push(BiliBiliCommand::new_raw(raw, false).into());
    }
  }

  fn push_parse_error(&mut self, buf: &mut Vec<CommandPacket>, message: String) {
    error!("{}", message);
    buf.push(BiliBiliPacketParseError::new(message).into())
  }
  // endregion
}

pub type ConnectResult<T> = Result<T, ConnectError>;

#[derive(thiserror::Error, Debug)]
pub enum ConnectError {
  #[error("failed to get actual roomid")]
  FailedToGetActualRoomid(#[from] room_info_getter::Error),
  #[error("illegal roomid: {0}")]
  IllegalRoomid(u32),
  #[error("failed to get server info")]
  FailedToGetServerInfo(#[from] danmu_server_info_getter::Error),
  #[error("failed to connect")]
  FailedToConnect(#[from] WebSocketConnectError),
  #[error("connection interrupted")]
  ConnectionInterrupted,
}

struct StatusConnectedData {
  last_heartbeat_ts: Instant,
  last_heartbeat_tick_ts: Instant,
  heartbeat_received: bool,
}

impl Default for StatusConnectedData {
  fn default() -> Self {
    Self {
      last_heartbeat_ts: Instant::now(),
      last_heartbeat_tick_ts: Instant::now(),
      heartbeat_received: true,
    }
  }
}
