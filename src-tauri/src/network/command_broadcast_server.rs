/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;
use std::time::Duration;

use log::{error, info, warn};
use static_object::StaticObject;
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio::time::timeout;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};

use crate::command::command_history_manager::CommandHistoryManager;
use crate::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::command::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use crate::command::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use crate::command::command_packet::app_command::AppCommand;
use crate::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::command::command_packet::CommandPacket;
use crate::config::config_manager::ConfigManager;
use crate::get_cfg;
use crate::network::api_request::gift_config_getter::GiftConfigGetter;
use crate::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::network::websocket::websocket_connection::WebSocketConnection;
use crate::utils::mutex_utils::a_lock;
use crate::utils::ws_utils::close_frame;

use super::websocket::websocket_connection::ConnectionId;

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;

#[derive(StaticObject)]
pub struct CommandBroadcastServer {
  connections: Mutex<HashMap<ConnectionId, WebSocketConnection>>,
}

impl CommandBroadcastServer {
  fn new() -> CommandBroadcastServer {
    CommandBroadcastServer {
      connections: Mutex::new(HashMap::new()),
    }
  }

  // region send api
  pub async fn broadcast_command(&mut self, command: CommandPacket) {
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      self.broadcast(Message::Text(str)).await;
      let result = CommandHistoryManager::i().write(&command).await;
      if let Err(err) = result {
        error!("{err}");
      }
    } else {
      error!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn broadcast_app_command(&mut self, app_command: AppCommand) {
    self
      .broadcast_command(CommandPacket::from_app_command(app_command))
      .await
  }

  pub async fn broadcast_bilibili_command(&mut self, bilibili_command: BiliBiliCommand) {
    self
      .broadcast_command(CommandPacket::from_bilibili_command(bilibili_command))
      .await
  }

  pub async fn send_command(&mut self, connection_id: String, command: CommandPacket) {
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      self.send(connection_id, Message::Text(str)).await
    } else {
      error!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn send_app_command(&mut self, connection_id: String, app_command: AppCommand) {
    self
      .send_command(connection_id, CommandPacket::from_app_command(app_command))
      .await
  }

  pub async fn send_bilibili_command(
    &mut self,
    connection_id: String,
    bilibili_command: BiliBiliCommand,
  ) {
    self
      .send_command(
        connection_id,
        CommandPacket::from_bilibili_command(bilibili_command),
      )
      .await
  }
  // endregion

  pub async fn broadcast(&mut self, message: Message) {
    for (id, conn) in &mut *a_lock(&self.connections).await {
      let timeout_result = timeout(Duration::from_secs(5), conn.send(message.clone())).await;
      if timeout_result.is_err() {
        warn!("connection {} send timeout, disconnecting.", id);
        conn.disconnect(None).await;
      }
    }
  }

  pub async fn send(&mut self, connection_id: String, message: Message) {
    if let Some(conn) = a_lock(&self.connections).await.get_mut(&connection_id) {
      conn.send(message).await;
    }
  }

  pub async fn disconnect(
    &mut self,
    connection_id: String,
    close_frame: Option<CloseFrame<'static>>,
  ) {
    if let Some(conn) = a_lock(&self.connections).await.get_mut(&connection_id) {
      conn.disconnect(close_frame).await;
    }
  }

  pub async fn close_all(&mut self) {
    info!("closing all connection");

    let mut connections = a_lock(&self.connections).await;

    for conn in (*connections).values_mut() {
      conn.disconnect(close_frame(CloseCode::Normal, "")).await;
    }
    connections.clear();

    info!("all connection closed");
  }

  pub async fn tick(&mut self) {
    let mut connections = a_lock(&self.connections).await;

    connections.retain(|_, connection| connection.is_connected());

    // region tick connections
    let mut incoming_messages = vec![];

    for (id, conn) in &mut *connections {
      let messages = conn.tick().await;
      for msg in messages {
        incoming_messages.push((id.clone(), msg))
      }
    }

    drop(connections);

    for (id, msg) in incoming_messages {
      self.on_message(msg, id).await;
    }
    // endregion
  }

  pub async fn accept(&mut self, websocket_stream: WebSocket) {
    let connection = WebSocketConnection::from_ws_stream(websocket_stream);

    let connection_id = connection.get_id();
    a_lock(&self.connections)
      .await
      .insert(connection_id.clone(), connection);
    self.on_connection(connection_id).await;
  }

  async fn on_connection(&mut self, connection_id: String) {
    info!("new connection, id: {} ", connection_id);

    self
      .send_app_command(
        connection_id.clone(),
        AppCommand::from_config_update(ConfigUpdate::new(&*get_cfg!())),
      )
      .await;

    self
      .send_app_command(
        connection_id.clone(),
        AppCommand::from_receiver_status_update(ReceiverStatusUpdate::new(
          DanmuReceiver::i().get_status(),
        )),
      )
      .await;

    let roomid = get_cfg!().backend.danmu_receiver.roomid;
    let gift_config_result = GiftConfigGetter::get(roomid).await;
    match gift_config_result {
      Ok(gift_config) => {
        if let Some(gift_config) = gift_config.data {
          self
            .send_app_command(
              connection_id.clone(),
              AppCommand::from_gift_config_update(GiftConfigUpdate::new(gift_config)),
            )
            .await;
        }
      }
      Err(err) => {
        error!("failed to get gift config: {:}", err)
      }
    }
  }

  async fn on_message(&mut self, message: Message, connection_id: String) {
    info!("{}: {:?} ", connection_id, message);

    self.send(connection_id, message).await;
  }
}
