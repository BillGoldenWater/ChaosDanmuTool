/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;

use log::{error, info};
use static_object::StaticObject;
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};
use chaos_danmu_tool_share::command_packet::app_command::config_update::ConfigUpdate;
use chaos_danmu_tool_share::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use chaos_danmu_tool_share::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use chaos_danmu_tool_share::command_packet::CommandPacket;

use crate::app::config_manager::ConfigManager;
use crate::command::command_history_manager::CommandHistoryManager;
use crate::get_cfg;
use crate::network::api_request::gift_config_getter::GiftConfigGetter;
use crate::network::danmu_receiver::DanmuReceiver;
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

  pub async fn broadcast_cmd(&mut self, command: CommandPacket) {
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

  pub async fn broadcast_cmd_many(&mut self, commands: Vec<CommandPacket>) {
    let commands_msgs = commands
      .iter()
      .filter_map(|cmd| {
        let result = cmd.to_string();
        if let Ok(cmd) = result {
          Some(Message::Text(cmd))
        } else {
          error!("failed to serialize command {:?}", result.unwrap_err());
          None
        }
      })
      .collect::<Vec<_>>();
    self.broadcast_many(commands_msgs).await;
    let result = CommandHistoryManager::i().write_many(&commands).await;
    if let Err(err) = result {
      error!("{err}");
    }
  }

  pub async fn send_cmd<Command: Into<CommandPacket>>(
    &mut self,
    connection_id: &ConnectionId,
    command: Command,
  ) {
    let command = command.into();
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      self.send(connection_id, Message::Text(str)).await
    } else {
      error!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn broadcast(&mut self, message: Message) {
    for conn in a_lock(&self.connections).await.values_mut() {
      conn.send(message.clone()).await;
    }
  }

  pub async fn broadcast_many(&mut self, messages: Vec<Message>) {
    for conn in a_lock(&self.connections).await.values_mut() {
      conn.send_many(messages.clone()).await;
    }
  }

  pub async fn send(&mut self, connection_id: &ConnectionId, message: Message) {
    if let Some(conn) = a_lock(&self.connections).await.get_mut(connection_id) {
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

    // region remove disconnected connections
    let mut disconnected_connections: Vec<ConnectionId> = vec![];

    for (id, conn) in &*connections {
      if !conn.is_connected().await {
        disconnected_connections.push(id.clone())
      }
    }

    for id in disconnected_connections {
      connections.remove(&id);
    }
    // endregion

    // region receive messages
    let mut incoming_messages = vec![];

    for (id, conn) in &mut *connections {
      let messages = conn.tick().await;
      for msg in messages {
        incoming_messages.push((id.clone(), msg))
      }
    }

    drop(connections);

    for (id, msg) in incoming_messages {
      self.on_message(msg, &id).await;
    }
    // endregion
  }

  pub async fn accept(&mut self, websocket_stream: WebSocket) {
    let connection = WebSocketConnection::from_ws_stream(websocket_stream);

    let connection_id = connection.get_id().clone();
    a_lock(&self.connections)
      .await
      .insert(connection_id.clone(), connection);
    self.on_connection(&connection_id).await;
  }

  async fn on_connection(&mut self, connection_id: &ConnectionId) {
    info!("new connection, id: {} ", connection_id);

    self
      .send_cmd(connection_id, ConfigUpdate::new((*get_cfg!()).clone()))
      .await;

    self
      .send_cmd(
        connection_id,
        ReceiverStatusUpdate::new(DanmuReceiver::i().get_status()),
      )
      .await;

    let roomid = get_cfg!().backend.danmu_receiver.roomid;
    let gift_config_result = GiftConfigGetter::get(roomid).await;
    match gift_config_result {
      Ok(gift_config) => {
        if let Some(gift_config) = gift_config.data {
          self
            .send_cmd(connection_id, GiftConfigUpdate::new(gift_config))
            .await;
        }
      }
      Err(err) => {
        error!("failed to get gift config: {:}", err)
      }
    }
  }

  async fn on_message(&mut self, message: Message, connection_id: &String) {
    info!("{}: {:?} ", connection_id, message);

    self.send(connection_id, message).await;
  }
}
