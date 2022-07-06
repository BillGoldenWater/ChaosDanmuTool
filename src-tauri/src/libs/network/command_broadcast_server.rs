/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::sync::Mutex;

use tauri::async_runtime::JoinHandle;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};
use tokio_tungstenite::MaybeTlsStream;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;

use crate::libs::network::websocket::websocket_connection::WebSocketConnection;

type Stream = MaybeTlsStream<TcpStream>;

lazy_static! {
  pub static ref COMMAND_BROADCAST_SERVER_STATIC_INSTANCE: Mutex<CommandBroadcastServer> = Mutex::new(CommandBroadcastServer::new());
}

pub struct CommandBroadcastServer {
  listening: bool,
  connections: Vec<WebSocketConnection>,
  rx: Option<UnboundedReceiver<Stream>>,
  listen_loop: Option<JoinHandle<()>>,
}

impl CommandBroadcastServer {
  fn new() -> CommandBroadcastServer {
    CommandBroadcastServer {
      listening: false,
      connections: vec![],
      rx: None,
      listen_loop: None,
    }
  }

  pub fn listen(url: String) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

    this.before_listen();

    let (tx, rx) = unbounded_channel();
    this.rx = Some(rx);

    this.listen_loop = Some(CommandBroadcastServer::listen_loop(url, tx));

    this.listening = true;
    println!("[WebSocketServer.listen] start listening")
  }

  pub fn listen_loop(url: String, tx: UnboundedSender<Stream>) -> JoinHandle<()> {
    tauri::async_runtime::spawn(async move {
      let try_socket = TcpListener::bind(&url).await;
      if try_socket.is_err() {
        println!("[WebSocketServer.listen_loop] Failed to bind");
        return;
      }
      let listener = try_socket.unwrap();

      while let Ok((stream, _)) = listener.accept().await {
        let send_result = tx.send(MaybeTlsStream::Plain(stream));
        if let Err(_) = send_result {
          println!("[WebSocketServer.listen_loop] failed send to main thread.")
        }
      }
    })
  }

  pub async fn broadcast(message: Message) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

    for connection in this.connections.as_mut_slice() {
      connection.send(message.clone()).await;
    }
  }

  pub async fn send(connection_id: String, message: Message) {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

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
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

    for connection in this.connections.as_mut_slice() {
      if connection.get_id().eq(&connection_id) {
        connection.disconnect(close_frame).await;
        break;
      }
    }
  }

  pub fn is_listening() -> bool {
    let this = &*COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();
    this.listening
  }

  async fn on_stop_listening(&mut self) {
    for connection in self.connections.as_mut_slice() {
      connection.disconnect(None).await;
    }
    self.connections.clear();
    self.listening = false;
    self.rx = None;
    self.listen_loop = None;
    println!("[WebSocketServer.on_stop_listening] stopped");
  }

  pub fn close() {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

    this.close_()
  }

  fn close_(&mut self) {
    if let Some(handle) = &mut self.listen_loop {
      handle.abort()
    }
  }

  fn before_listen(&mut self) {
    if self.listening {
      self.close_()
    }
  }

  pub async fn tick() {
    let this = &mut *COMMAND_BROADCAST_SERVER_STATIC_INSTANCE.lock().unwrap();

    this.connections.retain(|connection| connection.is_connected());
    if !this.listening { return; }

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

    if let Some(rx) = &mut this.rx {
      let rx_result = rx.try_recv(); // try_recv
      if let Ok(stream) = rx_result { // when incoming connection
        let mut connection = WebSocketConnection::new();

        let accept_result = connection.accept(stream).await;

        if accept_result.is_ok() {
          let connection_id = connection.get_id();
          this.connections.push(connection);
          this.on_connection(connection_id).await;
        }
      } else if let Err(err) = rx_result { // when failed recv
        if err == tokio::sync::mpsc::error::TryRecvError::Disconnected { // when stop listening
          this.on_stop_listening().await;
        }
      }
    }
  }

  async fn on_connection(&mut self, connection_id: String) {
    println!("[WebSocketServer.on_connection] id: {} ", connection_id);

    self.send_(connection_id.clone(), Message::Text(connection_id)).await;
  }

  async fn on_message(&mut self, message: Message, connection_id: String) {
    println!("[WebSocketServer.on_message] {}: {:?} ", connection_id, message);

    self.send_(connection_id, message).await;
  }
}
