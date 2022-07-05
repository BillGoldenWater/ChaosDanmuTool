/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Instant;

use bytes::BytesMut;
use tokio_tungstenite::tungstenite::Message;

use crate::libs::network::api_request::danmu_server_info_getter::DanmuServerInfoGetter;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiverConnectError::{FailedToConnect, GettingServerInfoFailed};
use crate::libs::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::libs::network::websocket::websocket_connection::{WebSocketConnectError, WebSocketConnection};

pub struct DanmuReceiver {
  websocket_connection: WebSocketConnection,
  last_heartbeat_ts: Instant,

  heartbeat_interval: u32,
}

impl DanmuReceiver {
  pub fn new(heartbeat_interval: u32) -> DanmuReceiver {
    DanmuReceiver {
      websocket_connection: WebSocketConnection::new(|message, connection_id| {
        Self::on_message(message, connection_id);
      }),
      last_heartbeat_ts: Instant::now(),
      heartbeat_interval,
    }
  }

  pub async fn connect(&mut self, room_id: i32) -> Result<(), DanmuReceiverConnectError> {
    let token_and_url_result =
      DanmuServerInfoGetter::get_token_and_url(room_id).await;

    if token_and_url_result.is_none() {
      return Err(GettingServerInfoFailed);
    }
    let token_and_url = token_and_url_result.unwrap();

    let connect_result =
      self.websocket_connection.connect(token_and_url.url.as_str()).await;

    if let Err(err) = connect_result {
      return Err(FailedToConnect(err));
    } else { // on open
      self.websocket_connection.send(Message::Binary(
        Packet::join(JoinPacketInfo {
          roomid: room_id,
          protover: 3,
          platform: "web".to_string(),
          key: token_and_url.token,
        }).pack().to_vec()
      )).await;
      // self.websocket_connection.update_message_handler(self);
    }

    Ok(())
  }

  pub async fn disconnect(&mut self) {
    self.websocket_connection.disconnect(None).await;
  }

  pub async fn tick(&mut self) {
    self.websocket_connection.tick();
    self.tick_heartbeat().await;
  }

  async fn tick_heartbeat(&mut self) {
    if self.last_heartbeat_ts.elapsed().as_secs() > self.heartbeat_interval as u64 {
      self.websocket_connection.send(Message::Binary(
        Packet::heartbeat().pack().to_vec()
      )).await;

      self.last_heartbeat_ts = Instant::now();
    }
  }

  pub fn is_connected(&self) -> bool {
    self.websocket_connection.is_connected()
  }

  fn on_message(message: Message, _connection_id: String) {
    match message {
      Message::Binary(data) => {
        println!("{:?}", Packet::from_bytes(&mut BytesMut::from(data.as_slice())));
      }
      _ => {
        println!("{:?}", message)
      }
    }
  }
}

#[derive(Debug)]
pub enum DanmuReceiverConnectError {
  GettingServerInfoFailed,
  FailedToConnect(WebSocketConnectError),
}


