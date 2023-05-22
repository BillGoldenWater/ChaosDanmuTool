/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::str::FromStr;
use std::time::Instant;

use log::{error, info, warn};
use static_object::StaticObject;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;

use chaos_danmu_tool_share::command_packet::app_command::receiver_status_update::{
  ReceiverStatus, ReceiverStatusUpdate,
};
use chaos_danmu_tool_share::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;

use crate::app::config_manager::modify_cfg;
use crate::cache::user_info_cache::UserInfoCache;
use crate::get_cfg;
use crate::network::api_request::bilibili_response::Error::EmptyData;
use crate::network::api_request::danmu_server_info_getter::{self, DanmuServerInfoGetter};
use crate::network::api_request::room_info_getter::{self, RoomInfoGetter};
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::network::danmu_receiver::packet_processor::PacketProcessor;
use crate::network::danmu_receiver::ConnectError::{
  FailedToConnect, FailedToGetServerInfo, IllegalRoomid,
};
use crate::network::websocket::websocket_connection::WebSocketConnectionError;
use crate::network::websocket::websocket_connection_reusable::WebSocketConnectionReusable;
use crate::utils::immutable_utils::Immutable;
use crate::utils::trace_utils::print_trace;
use crate::utils::ws_utils::close_frame;

pub mod data_type;
pub mod op_code;
pub mod packet;
pub mod packet_processor;

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
        self.set_status(ReceiverStatus::Close).await;
        self.ws.disconnect(close_frame(CloseCode::Normal, "")).await;
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

        let mut command_processor = PacketProcessor::default();
        for msg in messages {
          self.parse_message(&mut command_processor, msg).await
        }

        if command_processor.heartbeat_received {
          self.connected_data.heartbeat_received = true;
        }
        for user_info in command_processor.user_infos {
          UserInfoCache::i().update(user_info).await;
        }
        if !command_processor.commands.is_empty() {
          CommandBroadcastServer::i()
            .broadcast_cmd_many(command_processor.commands)
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
  async fn parse_message(&mut self, processor: &mut PacketProcessor, message: Message) {
    match message {
      Message::Binary(data) => processor.process(Packet::parse_bytes(&data.as_slice())),
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
  FailedToConnect(#[from] WebSocketConnectionError),
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
