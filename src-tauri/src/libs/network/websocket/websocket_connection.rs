/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use std::borrow::Cow;
use tokio::{
  net::TcpStream,
  sync::{
    mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender},
    Mutex,
  },
};
use tokio_tungstenite::tungstenite::error::ProtocolError;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::CloseFrame;
use tokio_tungstenite::tungstenite::Error;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

use crate::libs::utils::mutex_utils::{a_lock, lock};
use crate::{error, info};

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;
type WebSocketWriter = SplitSink<WebSocket, Message>;
type WebSocketReader = SplitStream<WebSocket>;
pub type ConnectionId = String;

pub struct WebSocketConnection {
  connection_id: ConnectionId, // const

  connected: Mutex<bool>,

  rx: UnboundedReceiver<Message>,
  writer: WebSocketWriter,
}

impl WebSocketConnection {
  pub async fn new_connection(url: &str) -> Result<Self, WebSocketConnectError> {
    let ws_stream = connect_async(url).await;

    if let Err(err) = ws_stream {
      return Err(WebSocketConnectError::ConnectFailed(err));
    }

    let this = Self::from_ws_stream(ws_stream.unwrap().0);

    Ok(this)
  }

  pub fn from_ws_stream(ws_stream: WebSocket) -> WebSocketConnection {
    let (writer, reader) = ws_stream.split();
    let (tx, rx) = unbounded_channel();
    Self::start_recv_loop(reader, tx);

    WebSocketConnection {
      connection_id: uuid::Uuid::new_v4().to_string(),

      connected: Mutex::new(true),

      rx,
      writer,
    }
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) {
    let mut connected = a_lock(&self.connected).await;

    if *connected {
      let _ = self.writer.send(Message::Close(close_frame)).await;
      let _ = self.writer.flush().await;
      let _ = self.writer.close().await;
      *connected = false;
    }

    drop(connected)
  }

  pub async fn send(&mut self, message: Message) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      let _ = self.writer.send(message).await;
    }

    drop(connected)
  }

  pub async fn feed(&mut self, message: Message) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      let _ = self.writer.feed(message).await;
    }

    drop(connected)
  }

  pub async fn flush(&mut self) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      let _ = self.writer.flush().await;
    }

    drop(connected)
  }

  pub async fn tick(&mut self) -> Vec<Message> {
    let mut connected = a_lock(&self.connected).await;

    if !*connected {
      return vec![];
    }

    let mut result = vec![];

    loop {
      let rx_result = self.rx.try_recv(); // try_recv

      if let Ok(msg) = rx_result {
        // when message
        result.push(msg);
      } else if let Err(err) = rx_result {
        // when failed recv
        if err == tokio::sync::mpsc::error::TryRecvError::Disconnected {
          // when disconnected
          *connected = false;
        }
        break;
      }
    }

    drop(connected);
    result
  }

  pub fn is_connected(&self) -> bool {
    *lock(&self.connected)
  }

  pub fn get_id(&self) -> String {
    self.connection_id.clone()
  }

  fn start_recv_loop(reader: WebSocketReader, tx: UnboundedSender<Message>) {
    let fut = async move {
      reader
        .for_each(move |item| {
          // reading
          let tx = tx.clone();

          async move {
            // each message
            Self::new_item(item, tx)
          }
        })
        .await;
    };
    tauri::async_runtime::spawn(fut);
  }

  fn new_item(item: Result<Message, Error>, tx: UnboundedSender<Message>) {
    let item = if let Err(err) = item {
      // err
      if let Error::Protocol(ProtocolError::ResetWithoutClosingHandshake) = err {
        Some(Message::Close(Some(CloseFrame {
          code: CloseCode::Abnormal,
          reason: Cow::Owned("unknown (ResetWithoutClosingHandshake)".to_string()),
        })))
      } else {
        error!("had an error: {:?}", err);
        None
      }
    } else {
      // ok
      Some(item.unwrap())
    };

    // forward
    if let Some(message) = item {
      let _ = tx.send(message);
    }
  }
}

impl Drop for WebSocketConnection {
  fn drop(&mut self) {
    if self.is_connected() {
      tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(self.disconnect(None))
      });
      info!("{}: closed on drop", self.connection_id);
    }
  }
}

#[derive(thiserror::Error, Debug)]
pub enum WebSocketConnectError {
  #[error("failed to connect")]
  ConnectFailed(#[from] Error),
}
