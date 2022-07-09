/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use futures_util::{SinkExt, StreamExt};
use futures_util::stream::{SplitSink, SplitStream};
use tokio::{net::TcpStream, sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender}};
use tokio_tungstenite::{connect_async, MaybeTlsStream, tungstenite::Message, WebSocketStream};
use tokio_tungstenite::tungstenite::Error;
use tokio_tungstenite::tungstenite::error::ProtocolError;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;

use crate::{elprintln, lprintln};

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;
type WebSocketWriter = SplitSink<WebSocket, Message>;
type WebSocketReader = SplitStream<WebSocket>;
type ConnectionId = String;

pub struct WebSocketConnection {
  connection_id: ConnectionId,

  connected: bool,

  write: Option<WebSocketWriter>,
  rx: Option<UnboundedReceiver<Message>>,
}

impl WebSocketConnection {
  pub fn new() -> WebSocketConnection {
    WebSocketConnection {
      connection_id: uuid::Uuid::new_v4().to_string(),

      connected: false,

      write: None,
      rx: None,
    }
  }

  pub async fn connect(&mut self, url: &str) -> Result<(), WebSocketConnectError> {
    self.before_connection().await;

    let ws_stream = connect_async(url).await;

    if let Err(err) = ws_stream {
      return Err(WebSocketConnectError::ConnectFailed(err));
    }

    self.handle_connection(ws_stream.unwrap().0.split());

    lprintln!("connected");
    Ok(())
  }

  pub async fn accept(&mut self, ws_stream: WebSocket) -> Result<(), WebSocketAcceptError> {
    self.before_connection().await;

    self.handle_connection(ws_stream.split());

    lprintln!("accepted");
    Ok(())
  }

  fn handle_connection(&mut self, (write, read): (WebSocketWriter, WebSocketReader)) {
    self.write = Some(write);

    let (tx, rx) = unbounded_channel();
    self.rx = Some(rx);

    WebSocketConnection::recv_loop(read, tx);

    self.connected = true;
  }

  async fn before_connection(&mut self) {
    if self.connected {
      self.disconnect(None).await;
    }
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) {
    if let Some(write) = &mut self.write {
      let _ = write.send(Message::Close(close_frame)).await;
      let _ = write.close().await;
    }
  }

  pub async fn send(&mut self, message: Message) {
    if let Some(write) = &mut self.write {
      let _ = write.send(message).await;
    }
  }

  pub async fn tick(&mut self) -> Vec<Message> {
    if !self.connected { return vec![]; }

    let mut result = vec![];

    loop {
      if let Some(rx) = &mut self.rx {
        let rx_result = rx.try_recv(); // try_recv
        if let Ok(msg) = rx_result { // when message
          result.push(msg);
        } else if let Err(err) = rx_result { // when failed recv
          if err == tokio::sync::mpsc::error::TryRecvError::Disconnected { // when disconnected
            self.on_disconnect();
          }
          break;
        }
      }
    }

    result
  }

  pub fn is_connected(&self) -> bool {
    self.connected
  }

  fn on_disconnect(&mut self) {
    self.connected = false;
    self.write = None;
    self.rx = None;
    lprintln!("disconnected");
  }

  fn recv_loop(read: WebSocketReader, tx: UnboundedSender<Message>) {
    tauri::async_runtime::spawn(async move {
      read.for_each(move |item| { // reading
        let tx = tx.clone();
        async move { // each message
          let item = if let Err(err) = item { // err
          elprintln!("had an error: {:?}", err);
            match err {
              Error::Protocol(err) => {
                match err {
                  ProtocolError::ResetWithoutClosingHandshake => {
                    Some(Message::Close(Some(CloseFrame {
                      code: CloseCode::Abnormal,
                      reason: Cow::Owned("unknown (ResetWithoutClosingHandshake)".to_string())
                    })))
                  }
                  _ => {None}
                }
              }
              _ => {None}
            }
          } else { // ok
            Some(item.unwrap())
          };

          // forward
          if let Some(message) = item {
            let send_result = tx.clone().send(message);
            if send_result.is_err() {
              elprintln!("failed to send message back")
            }
          }
        }
      }).await
    });
  }

  pub fn get_id(&self) -> String {
    self.connection_id.clone()
  }
}

#[derive(Debug)]
pub enum WebSocketConnectError {
  ConnectFailed(Error),
}

#[derive(Debug)]
pub enum WebSocketAcceptError {
  HandshakeFailed(Error),
}