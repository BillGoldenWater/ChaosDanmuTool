/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};

use crate::libs::command::command_history_manager::CommandHistoryManager;
use crate::libs::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::libs::command::command_packet::app_command::gift_config_update::GiftConfigUpdate;
use crate::libs::command::command_packet::app_command::receiver_status_update::ReceiverStatusUpdate;
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::config::config_manager::ConfigManager;
use crate::libs::network::api_request::gift_config_getter::GiftConfigGetter;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::libs::network::websocket::websocket_connection::WebSocketConnection;
use crate::{error, info};

lazy_static! {
  pub static ref COMMAND_BROADCAST_SERVER_STATIC_INSTANCE: Mutex<CommandBroadcastServer> =
    Mutex::new(CommandBroadcastServer::new());
}

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;

pub struct CommandBroadcastServer {
  connections: Vec<WebSocketConnection>,
}

impl CommandBroadcastServer {
  fn new() -> CommandBroadcastServer {
    CommandBroadcastServer {
      connections: vec![],
    }
  }

  // region send api
  pub async fn broadcast_command(command: CommandPacket) {
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      Self::broadcast(Message::Text(str)).await;
      CommandHistoryManager::write(&command).await;
    } else {
      error!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn broadcast_app_command(app_command: AppCommand) {
    Self::broadcast_command(CommandPacket::from_app_command(app_command)).await
  }

  pub async fn broadcast_bilibili_command(bilibili_command: BiliBiliCommand) {
    Self::broadcast_command(CommandPacket::from_bilibili_command(bilibili_command)).await
  }

  pub async fn send_command(&mut self, connection_id: String, command: CommandPacket) {
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      self.send_(connection_id, Message::Text(str)).await
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

  async fn broadcast(message: Message) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;
    this.broadcast_(message).await
  }

  async fn broadcast_(&mut self, message: Message) {
    for connection in self.connections.as_mut_slice() {
      connection.send(message.clone()).await;
    }
  }

  pub async fn send(connection_id: String, message: Message) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    this.send_(connection_id, message).await;
  }

  async fn send_(&mut self, connection_id: String, message: Message) {
    for connection in self.connections.as_mut_slice() {
      if connection.get_id().eq(&connection_id) {
        connection.send(message).await;
        break;
      }
    }
  }

  pub async fn disconnect(connection_id: String, close_frame: Option<CloseFrame<'static>>) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    for connection in this.connections.as_mut_slice() {
      if connection.get_id().eq(&connection_id) {
        connection.disconnect(close_frame).await;
        break;
      }
    }
  }

  pub async fn close_all() {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    this.close_all_().await
  }

  async fn close_all_(&mut self) {
    info!("closing all connection");
    for connection in self.connections.as_mut_slice() {
      connection.disconnect(None).await;
    }
    self.connections.clear();
    info!("all connection closed");
  }

  pub async fn tick() {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    this
      .connections
      .retain(|connection| connection.is_connected());

    // region tick connections
    let mut incoming_messages: Vec<(String, Message)> = vec![];
    for connection in this.connections.as_mut_slice() {
      let messages = connection.tick().await;
      for msg in messages {
        incoming_messages.push((connection.get_id(), msg));
      }
    }
    for (id, msg) in incoming_messages {
      this.on_message(msg, id).await;
    }
    // endregion
  }

  pub async fn accept(websocket_stream: WebSocket) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    this.accept_(websocket_stream).await
  }

  async fn accept_(&mut self, websocket_stream: WebSocket) {
    let mut connection = WebSocketConnection::new();

    let accept_result = connection.accept(websocket_stream).await;

    if accept_result.is_ok() {
      let connection_id = connection.get_id();
      self.connections.push(connection);
      self.on_connection(connection_id).await;
    }
  }

  async fn on_connection(&mut self, connection_id: String) {
    info!("new connection, id: {} ", connection_id);

    self
      .send_app_command(
        connection_id.clone(),
        AppCommand::from_config_update(ConfigUpdate::new(ConfigManager::get_config().await)),
      )
      .await;
    self
      .send_app_command(
        connection_id.clone(),
        AppCommand::from_receiver_status_update(ReceiverStatusUpdate::new(
          DanmuReceiver::get_status().await,
        )),
      )
      .await;

    let roomid = ConfigManager::get_config()
      .await
      .backend
      .danmu_receiver
      .roomid;
    let gift_config = GiftConfigGetter::get(roomid).await;
    if let Some(gift_config) = gift_config {
      if let Some(gift_config) = gift_config.data {
        self
          .send_app_command(
            connection_id.clone(),
            AppCommand::from_gift_config_update(GiftConfigUpdate::new(gift_config)),
          )
          .await;
      }
    }
  }

  async fn on_message(&mut self, message: Message, connection_id: String) {
    info!("{}: {:?} ", connection_id, message);

    self.send_(connection_id, message).await;
  }
}
