/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::time::Duration;

use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use log::{error, info};
use tokio::time::error::Elapsed;
use tokio::time::timeout;
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
use tokio_tungstenite::tungstenite::Error as WsError;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

use crate::utils::async_utils::run_blocking;
use crate::utils::mutex_utils::a_lock;

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;
type WebSocketWriter = SplitSink<WebSocket, Message>;
type WebSocketReader = SplitStream<WebSocket>;
pub type ConnectionId = String;

pub struct WebSocketConnection {
  connection_id: ConnectionId, // const

  connected: Mutex<bool>,

  rx: UnboundedReceiver<Message>,
  writer: WebSocketWriter,

  send_timeout: Option<Duration>,
}

impl WebSocketConnection {
  pub async fn new_connection(url: &str) -> Result<Self, WebSocketConnectionError> {
    let ws_stream = connect_async(url).await;

    if let Err(err) = ws_stream {
      return Err(WebSocketConnectionError::WsError(err));
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

      send_timeout: None,
    }
  }

  pub fn set_send_timeout(&mut self, timeout: Option<Duration>) {
    self.send_timeout = timeout;
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) -> WsResult<()> {
    let mut connected = a_lock("wsConn_connected", &self.connected).await;

    if *connected {
      if let Some(send_timeout) = self.send_timeout {
        timeout(send_timeout, async {
          self.writer.send(Message::Close(close_frame)).await?;
          self.writer.flush().await?;
          self.writer.close().await?;
          WsResult::<()>::Ok(())
        })
        .await??;
        *connected = false;
      } else {
        self.writer.send(Message::Close(close_frame)).await?;
        self.writer.flush().await?;
        self.writer.close().await?;
        *connected = false;
      }
    }

    drop(connected);
    Ok(())
  }

  pub async fn send(&mut self, message: Message) -> WsResult<()> {
    let connected = a_lock("wsConn_connected", &self.connected).await;

    if *connected {
      if let Some(send_timeout) = self.send_timeout {
        timeout(send_timeout, async {
          self.writer.send(message).await?;
          WsResult::<()>::Ok(())
        })
        .await??;
      } else {
        self.writer.send(message).await?;
      }
    }

    drop(connected);
    Ok(())
  }

  pub async fn send_many(&mut self, messages: Vec<Message>) -> WsResult<()> {
    let connected = a_lock("wsConn_connected", &self.connected).await;

    if *connected {
      for msg in messages {
        self.writer.feed(msg).await?;
      }

      if let Some(send_timeout) = self.send_timeout {
        timeout(send_timeout, async {
          self.writer.flush().await?;
          WsResult::<()>::Ok(())
        })
        .await??;
      } else {
        self.writer.flush().await?;
      }
    }

    drop(connected);
    Ok(())
  }

  pub async fn tick(&mut self) -> Vec<Message> {
    let mut connected = a_lock("wsConn_connected", &self.connected).await;

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
    *a_lock("wsConn_connected", &self.connected).await
  }

  pub fn get_id(&self) -> &ConnectionId {
    &self.connection_id
  }

  fn start_recv_loop(reader: WebSocketReader, tx: UnboundedSender<Message>) {
    tauri::async_runtime::spawn(async move {
      reader
        .for_each(|item| {
          // reading
          let tx = tx.clone();

          async move {
            // each message
            Self::new_item(item, tx)
          }
        })
        .await;
    });
  }

  fn new_item(item: Result<Message, WsError>, tx: UnboundedSender<Message>) {
    let item = match item {
      Ok(item) => Some(item),
      Err(err) => {
        if let WsError::Protocol(ProtocolError::ResetWithoutClosingHandshake) = err {
          Some(Message::Close(Some(CloseFrame {
            code: CloseCode::Abnormal,
            reason: Cow::Owned("unknown (ResetWithoutClosingHandshake)".to_string()),
          })))
        } else {
          error!("had an error: {:?}", err);
          None
        }
      }
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
        let result = self.disconnect(None).await;
        if let Err(err) = result {
          error!(
            "{}: failed to disconnect on drop {err:?}",
            self.connection_id
          );
        } else {
          info!("{}: closed on drop", self.connection_id);
        }
      }
    });
  }
}

#[derive(thiserror::Error, Debug)]
pub enum WebSocketConnectionError {
  #[error("websocket error")]
  WsError(#[from] WsError),
  #[error("send timeout reached")]
  SendTimeout(#[from] Elapsed),
}

pub type WsResult<T> = Result<T, WebSocketConnectionError>;
