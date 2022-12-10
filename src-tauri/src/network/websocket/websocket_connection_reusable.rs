/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tokio_tungstenite::tungstenite::{protocol::CloseFrame, Message};

use super::websocket_connection::{WebSocketConnectError, WebSocketConnection};

pub struct WebSocketConnectionReusable {
  inner: Option<WebSocketConnection>,
}

impl WebSocketConnectionReusable {
  pub fn new() -> Self {
    Self { inner: None }
  }

  pub async fn connect(&mut self, url: &str) -> Result<(), WebSocketConnectError> {
    self.inner = Some(WebSocketConnection::new_connection(url).await?);
    Ok(())
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) {
    if let Some(ws) = &mut self.inner {
      ws.disconnect(close_frame).await
    }
  }

  pub async fn send(&mut self, message: Message) {
    if let Some(ws) = &mut self.inner {
      ws.send(message).await
    }
  }

  pub async fn feed(&mut self, message: Message) {
    if let Some(ws) = &mut self.inner {
      ws.feed(message).await
    }
  }

  pub async fn flush(&mut self) {
    if let Some(ws) = &mut self.inner {
      ws.flush().await
    }
  }

  pub async fn tick(&mut self) -> Vec<Message> {
    if let Some(ws) = &mut self.inner {
      ws.tick().await
    } else {
      vec![]
    }
  }

  pub fn is_connected(&self) -> bool {
    if let Some(ws) = &self.inner {
      ws.is_connected()
    } else {
      false
    }
  }

  pub fn get_id(&self) -> String {
    if let Some(ws) = &self.inner {
      ws.get_id()
    } else {
      unreachable!("cannot get id of uninitialized connection")
    }
  }
}
