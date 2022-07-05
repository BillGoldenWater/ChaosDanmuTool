/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::async_runtime::JoinHandle;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};
use tokio_tungstenite::MaybeTlsStream;
use tokio_tungstenite::tungstenite::Message;

use crate::libs::network::websocket::websocket_connection::WebSocketConnection;
use crate::libs::network::websocket::websocket_server::WebSocketServerEvent::OnConnection;

pub struct CallbackFn(Box<dyn (FnMut(WebSocketServerEvent))>);

unsafe impl Send for CallbackFn {}

unsafe impl Sync for CallbackFn {}

type Stream = MaybeTlsStream<TcpStream>;

pub struct WebSocketServer {
  event_handler: CallbackFn,

  listening: bool,
  connections: Vec<WebSocketConnection>,
  rx: Option<UnboundedReceiver<Stream>>,
  listen_loop: Option<JoinHandle<()>>,
}

impl WebSocketServer {
  pub fn new<F: FnMut(WebSocketServerEvent) + 'static>(event_handler: F) -> WebSocketServer {
    WebSocketServer {
      event_handler: CallbackFn(Box::new(event_handler)),
      listening: false,
      connections: vec![],
      rx: None,
      listen_loop: None,
    }
  }

  pub fn listen(&mut self, url: String) {
    self.before_listen();

    let (tx, rx) = unbounded_channel();
    self.rx = Some(rx);

    self.listen_loop = Some(WebSocketServer::listen_loop(url, tx));

    self.listening = true;
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

  pub async fn broadcast(&mut self, message: Message) {
    for connection in self.connections.as_mut_slice() {
      connection.send(message.clone()).await;
    }
  }

  pub fn get_connection(&mut self, connection_id: String) -> Option<&mut WebSocketConnection> {
    for connection in self.connections.as_mut_slice() {
      if connection.get_id().eq(&connection_id) {
        return Some(connection);
      }
    }
    None
  }

  pub fn is_listening(&self) -> bool {
    self.listening
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

  pub fn close(&mut self) {
    if let Some(handle) = &mut self.listen_loop {
      handle.abort()
    }
  }

  fn before_listen(&mut self) {
    if self.listening {
      self.close();
    }
  }

  pub async fn tick(&mut self) {
    self.connections.retain(|connection| connection.is_connected());
    if !self.listening { return; }

    for connection in self.connections.as_mut_slice() {
      connection.tick();
    }

    if let Some(rx) = &mut self.rx {
      let rx_result = rx.try_recv(); // try_recv
      if let Ok(stream) = rx_result { // when incoming connection
        let mut connection = WebSocketConnection::new(|message, connection_id| {
          Self::on_message(message, connection_id);
        });

        let accept_result = connection.accept(stream).await;

        if accept_result.is_ok() {
          let connection_id = connection.get_id();
          self.connections.push(connection);
          (self.event_handler.0)(OnConnection(connection_id));
        }
      } else if let Err(err) = rx_result { // when failed recv
        if err == tokio::sync::mpsc::error::TryRecvError::Disconnected { // when stop listening
          self.on_stop_listening().await;
        }
      }
    }
  }

  fn on_message(message: Message, connection_id: String) {
    println!("[WebSocketServer.on_message] {}: {:?} ", connection_id, message)
  }
}

pub enum WebSocketServerEvent {
  OnConnection(String),
  // OnMessage(Message, String),
}
