/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;

use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use log::{error, info};
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

use crate::utils::async_utils::run_blocking;
use crate::utils::mutex_utils::a_lock;

macro_rules! log_err {
  ($methodName:literal, $expr:expr) => {{
    let result = $expr;
    if let Err(err) = result {
      match err {
        Error::ConnectionClosed => {}
        _ => {
          error!(
            "error occurs in {__methodName__} \n{err}",
            __methodName__ = $methodName
          );
        }
      }
    }
  }};
}

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
      log_err!(
        "disconnect",
        self.writer.send(Message::Close(close_frame)).await
      );
      log_err!("disconnect", self.writer.flush().await);
      log_err!("disconnect", self.writer.close().await);
      *connected = false;
    }

    drop(connected)
  }

  pub async fn send(&mut self, message: Message) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      log_err!("send", self.writer.send(message).await);
    }

    drop(connected)
  }

  pub async fn feed(&mut self, message: Message) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      log_err!("feed", self.writer.feed(message).await);
    }

    drop(connected)
  }

  pub async fn flush(&mut self) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      log_err!("flush", self.writer.flush().await);
    }

    drop(connected)
  }

  pub async fn send_many(&mut self, messages: Vec<Message>) {
    let connected = a_lock(&self.connected).await;

    if *connected {
      for msg in messages {
        log_err!("send_many", self.writer.feed(msg).await);
      }

      log_err!("send_many", self.writer.flush().await);
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

  pub async fn is_connected(&self) -> bool {
    *a_lock(&self.connected).await
  }

  pub fn get_id(&self) -> &ConnectionId {
    &self.connection_id
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
      // safe to ignore.
      // no full because unbounded.
      // if closed, this will quickly exit.
      let _ = tx.send(message);
    }
  }
}

impl Drop for WebSocketConnection {
  fn drop(&mut self) {
    run_blocking(async {
      if self.is_connected().await {
        self.disconnect(None).await;
        info!("{}: closed on drop", self.connection_id);
      }
    });
  }
}

#[derive(thiserror::Error, Debug)]
pub enum WebSocketConnectError {
  #[error("failed to connect")]
  ConnectFailed(#[from] Error),
}