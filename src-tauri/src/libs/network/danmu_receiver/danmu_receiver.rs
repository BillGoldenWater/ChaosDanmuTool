/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Instant;

use bytes::{Buf, BytesMut};
use serde_json::{Map, Value};
use static_object::StaticObject;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;

use crate::libs::command::command_packet::app_command::bilibili_packet_parse_error::BiliBiliPacketParseError;
use crate::libs::command::command_packet::app_command::receiver_status_update::{
  ReceiverStatus, ReceiverStatusUpdate,
};
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::activity_update::ActivityUpdate;
use crate::libs::command::command_packet::bilibili_command::danmu_message::DanmuMessage;
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::config::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;
use crate::libs::config::config_manager::{modify_cfg, ConfigManager};
use crate::libs::network::api_request::danmu_server_info_getter::DanmuServerInfoGetter;
use crate::libs::network::api_request::room_info_getter::RoomInfoGetter;
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiverConnectError::{
  FailedToConnect, GettingActualRoomidFailed, GettingServerInfoFailed,
};
use crate::libs::network::danmu_receiver::data_type::DataType;
use crate::libs::network::danmu_receiver::op_code::OpCode;
use crate::libs::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::libs::network::websocket::websocket_connection::{
  WebSocketConnectError, WebSocketConnection,
};
use crate::libs::utils::mut_bytes_utils::bytes_to_hex;
use crate::{error, get_cfg, info, warn};

#[derive(StaticObject)]
pub struct DanmuReceiver {
  websocket_connection: WebSocketConnection,
  status: ReceiverStatus,

  last_heartbeat_ts: Instant,
  heartbeat_received: bool,

  reconnect_count: u32,

  heartbeat_interval: u32,
  heartbeat_timeout: u32,
}

impl DanmuReceiver {
  fn new() -> DanmuReceiver {
    todo!("thread safe");
    DanmuReceiver {
      websocket_connection: WebSocketConnection::new(),
      status: ReceiverStatus::Close,

      last_heartbeat_ts: Instant::now(),
      heartbeat_received: true,

      reconnect_count: 0,

      heartbeat_interval: 30,
      heartbeat_timeout: 2,
    }
  }

  pub async fn connect(&mut self) -> Result<(), DanmuReceiverConnectError> {
    self.set_status(ReceiverStatus::Connecting).await;
    let cfg = self.fetch_config().await;

    // region get actual room id
    let roomid = cfg.roomid;
    let cache_prefix = &format!("{}|", roomid);
    let actual_roomid = if let Ok(actual_roomid) =
      u32::from_str(cfg.actual_roomid_cache.trim_start_matches(cache_prefix))
    {
      // try get from cache
      actual_roomid
    } else if let Some(actual_roomid) = /* get online */
      RoomInfoGetter::get_actual_room_id(roomid).await
    {
      modify_cfg(
        |cfg| {
          (*cfg).backend.danmu_receiver.actual_roomid_cache =
            format!("{}|{}", roomid, actual_roomid);
        },
        true,
      )
      .await;

      actual_roomid
    } else {
      // err
      self.set_status(ReceiverStatus::Close).await;
      return Err(GettingActualRoomidFailed);
    };

    // endregion
    self.check_interrupt()?;

    // region get server info
    let token_and_url_result = DanmuServerInfoGetter::get_token_and_url(actual_roomid).await;

    if token_and_url_result.is_none() {
      self.set_status(ReceiverStatus::Close).await;
      return Err(GettingServerInfoFailed);
    }
    let token_and_url = token_and_url_result.unwrap();
    // endregion
    self.check_interrupt()?;

    // region connect
    let connect_result = self
      .websocket_connection
      .connect(token_and_url.url.as_str())
      .await;

    if let Err(err) = connect_result {
      self.set_status(ReceiverStatus::Close).await;
      return Err(FailedToConnect(err));
    } else {
      // on open
      self
        .websocket_connection
        .send(Message::Binary(
          Packet::join(JoinPacketInfo {
            roomid: actual_roomid,
            protover: 3,
            platform: "web".to_string(),
            key: token_and_url.token,
          })
          .pack()
          .to_vec(),
        ))
        .await;
      // region init heartbeat
      self.heartbeat_received = true;
      // endregion
      self.reconnect_count = 0;
    }
    // endregion

    self.set_status(ReceiverStatus::Connected).await;
    info!("room {} connected", actual_roomid);
    Ok(())
  }

  fn check_interrupt(&self) -> Result<(), DanmuReceiverConnectError> {
    if self.status == ReceiverStatus::Interrupted {
      Err(DanmuReceiverConnectError::ConnectionInterrupted)
    } else {
      Ok(())
    }
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) {
    match self.status {
      ReceiverStatus::Close | ReceiverStatus::Interrupted | ReceiverStatus::Error => {
        warn!("already closed");
      }
      ReceiverStatus::Connected => {
        info!("disconnecting");
        self.websocket_connection.disconnect(close_frame).await;
        info!("disconnected");
      }
      ReceiverStatus::Connecting | ReceiverStatus::Reconnecting => {
        info!("interrupting");
        self.set_status(ReceiverStatus::Interrupted).await;
      }
    }
  }

  pub async fn tick(&mut self) {
    // region recv message
    let messages = self.websocket_connection.tick().await;

    for msg in messages {
      self.on_message(msg).await;
    }
    // endregion

    // region tick heartbeat
    if self.status == ReceiverStatus::Connected {
      self.tick_heartbeat().await;
    }
    // endregion

    // region tick reconnect
    if self.status == ReceiverStatus::Error {
      let cfg = self.fetch_config().await;
      if cfg.auto_reconnect {
        self.set_status(ReceiverStatus::Reconnecting).await;
      } else {
        self.set_status(ReceiverStatus::Close).await;
      }
    }
    if self.status == ReceiverStatus::Reconnecting {
      info!("reconnecting (count: {})", self.reconnect_count);
      let result = self.connect().await;
      if let Err(err) = result {
        error!("unable to reconnect: {:?}", err);
      }
      self.reconnect_count += 1;
    }
    // endregion

    if !self.is_connected() && self.status != ReceiverStatus::Close {
      self.on_disconnect(true).await;
    }
  }

  async fn tick_heartbeat(&mut self) {
    let elapsed = self.last_heartbeat_ts.elapsed().as_secs();

    if !self.heartbeat_received && elapsed > self.heartbeat_timeout as u64 {
      error!("heartbeat timeout");
      self
        .disconnect(Some(CloseFrame {
          code: CloseCode::Abnormal,
          reason: Cow::Owned("".to_string()),
        }))
        .await;
      return;
    }

    if elapsed > self.heartbeat_interval as u64 {
      self
        .websocket_connection
        .send(Message::Binary(Packet::heartbeat().pack().to_vec()))
        .await;

      self.last_heartbeat_ts = Instant::now();
      self.heartbeat_received = false;
    }
  }

  pub fn is_connected(&self) -> bool {
    self.websocket_connection.is_connected()
  }

  pub fn get_status(&self) -> ReceiverStatus {
    self.status.clone()
  }

  async fn fetch_config(&mut self) -> Arc<DanmuReceiverConfig> {
    let cfg = get_cfg!().backend.danmu_receiver.clone();
    self.heartbeat_interval = cfg.heartbeat_interval as u32;
    Arc::new(cfg)
  }

  async fn set_status(&mut self, status: ReceiverStatus) {
    self.status = status.clone();
    CommandBroadcastServer::i()
      .broadcast_app_command(AppCommand::from_receiver_status_update(
        ReceiverStatusUpdate::new(status),
      ))
      .await;
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

        self.heartbeat_received = true;

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

        let str_parse_result = std::str::from_utf8(packet.body.as_ref());
        if let Ok(str) = str_parse_result {
          let json_parse_result = serde_json::from_str::<Value>(str);
          if let Ok(raw) = json_parse_result {
            let map = Map::new();
            let cmd = raw
              .as_object()
              .unwrap_or(&map)
              .get("cmd")
              .unwrap_or(&Value::Null)
              .as_str()
              .unwrap_or("");

            let command = if cmd.starts_with("DANMU_MSG") {
              let dm_parse_result = DanmuMessage::from_raw(raw);

              if let Ok(dm) = dm_parse_result {
                BiliBiliCommand::from_danmu_message(dm)
              } else {
                error!("unable to parse danmu message {:?}", dm_parse_result);
                return;
              }
            } else {
              BiliBiliCommand::from_raw(raw)
            };

            CommandBroadcastServer::i()
              .broadcast_bilibili_command(command)
              .await;
          } else {
            error!("unable to parse message\n{}", str)
          }
        } else {
          error!(
            "unable to decode message to utf8\n{}",
            bytes_to_hex(&packet.body)
          );
        }
      }
      _ => {
        let message = format!("unexpected op_code: {:?}", packet.op_code);
        Self::on_parse_error(message).await
      }
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

#[derive(Debug)]
pub enum DanmuReceiverConnectError {
  GettingActualRoomidFailed,
  GettingServerInfoFailed,
  FailedToConnect(WebSocketConnectError),
  ConnectionInterrupted,
}
