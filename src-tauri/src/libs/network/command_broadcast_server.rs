/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;

use crate::{elprintln, lprintln};
use crate::libs::command::command_history_manager::CommandHistoryManager;
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::bilibili_command::BiliBiliCommand;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::network::websocket::websocket_connection::WebSocketConnection;

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
        CommandHistoryManager::write(&command);
    } else {
      elprintln!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn broadcast_app_command(app_command: AppCommand) {
    Self::broadcast_command(CommandPacket::from_app_command(app_command)).await
  }

  pub async fn broadcast_bilibili_command(bilibili_command: BiliBiliCommand) {
    Self::broadcast_command(CommandPacket::from_bilibili_command(bilibili_command)).await
  }

  pub async fn send_command(connection_id: String, command: CommandPacket) {
    let command_str_result = command.to_string();

    if let Ok(str) = command_str_result {
      Self::send(connection_id, Message::Text(str)).await
    } else {
      elprintln!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn send_app_command(connection_id: String, app_command: AppCommand) {
    Self::send_command(connection_id, CommandPacket::from_app_command(app_command)).await
  }

  pub async fn send_bilibili_command(connection_id: String, bilibili_command: BiliBiliCommand) {
    Self::send_command(
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

  async fn send(connection_id: String, message: Message) {
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
    lprintln!("closing all connection");
    for connection in self.connections.as_mut_slice() {
      connection.disconnect(None).await;
    }
    self.connections.clear();
    lprintln!("all connection closed");
  }

  pub async fn tick() {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().await;

    this.connections
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
    lprintln!("new connection, id: {} ", connection_id);

    self.send_(connection_id.clone(), Message::Text(connection_id))
      .await;
  }

  async fn on_message(&mut self, message: Message, connection_id: String) {
    lprintln!("{}: {:?} ", connection_id, message);

    self.send_(connection_id, message).await;
  }
}
