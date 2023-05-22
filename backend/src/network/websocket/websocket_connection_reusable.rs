/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Duration;

use tokio_tungstenite::tungstenite::{protocol::CloseFrame, Message};

use crate::network::websocket::websocket_connection::WsResult;

use super::websocket_connection::{WebSocketConnection, WebSocketConnectionError};

pub struct WebSocketConnectionReusable {
  inner: Option<WebSocketConnection>,

  send_timeout: Option<Duration>,
}

impl WebSocketConnectionReusable {
  pub fn new() -> Self {
    Self {
      inner: None,
      send_timeout: None,
    }
  }

  pub async fn connect(&mut self, url: &str) -> Result<(), WebSocketConnectionError> {
    let mut connection = WebSocketConnection::new_connection(url).await?;
    connection.set_send_timeout(self.send_timeout);
    self.inner = Some(connection);
    Ok(())
  }

  pub fn set_send_timeout(&mut self, timeout: Option<Duration>) {
    self.send_timeout = timeout;
    if let Some(ws) = &mut self.inner {
      ws.set_send_timeout(self.send_timeout)
    }
  }

  pub async fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) -> WsResult<()> {
    if let Some(ws) = &mut self.inner {
      ws.disconnect(close_frame).await?;
    }
    Ok(())
  }

  pub async fn send(&mut self, message: Message) -> WsResult<()> {
    if let Some(ws) = &mut self.inner {
      ws.send(message).await?;
    }
    Ok(())
  }

  pub async fn send_many(&mut self, messages: Vec<Message>) -> WsResult<()> {
    if let Some(ws) = &mut self.inner {
      ws.send_many(messages).await?;
    }
    Ok(())
  }

  pub fn tick(&mut self) -> Vec<Message> {
    if let Some(ws) = &mut self.inner {
      ws.tick()
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

  pub fn get_id(&self) -> &String {
    if let Some(ws) = &self.inner {
      ws.get_id()
    } else {
      unreachable!("cannot get id of uninitialized connection")
    }
  }
}
