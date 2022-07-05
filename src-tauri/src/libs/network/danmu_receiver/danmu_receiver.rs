/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Instant;

use tokio_tungstenite::tungstenite::Message;

use crate::libs::network::api_request::danmu_server_info_getter::DanmuServerInfoGetter;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiverConnectError::{FailedToConnect, GettingServerInfoFailed};
use crate::libs::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::libs::network::websocket::websocket_client::WebSocketClient;

pub struct DanmuReceiver {
  websocket_client: WebSocketClient,
  last_heartbeat_ts: Instant,

  heartbeat_interval: u32,
}

impl DanmuReceiver {
  pub fn new(heartbeat_interval: u32) -> DanmuReceiver {
    DanmuReceiver {
      websocket_client: WebSocketClient::new(|message| {
        Self::on_message(message)
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

    let connect_success = self.websocket_client.connect(token_and_url.url.as_str()).await;
    if !connect_success {
      return Err(FailedToConnect);
    } else { // on open
      self.websocket_client.send(Message::Binary(
        Packet::join(JoinPacketInfo {
          roomid: room_id,
          protover: 3,
          platform: "web".to_string(),
          key: token_and_url.token,
        }).pack().to_vec()
      )).await
    }

    Ok(())
  }

  pub async fn disconnect(&mut self) {
    self.websocket_client.disconnect(None).await;
  }

  pub async fn tick(&mut self) {
    self.websocket_client.tick();
    self.tick_heartbeat().await;
  }

  async fn tick_heartbeat(&mut self) {
    if self.last_heartbeat_ts.elapsed().as_secs() > self.heartbeat_interval as u64 {
      self.websocket_client.send(Message::Binary(
        Packet::heartbeat().pack().to_vec()
      )).await;

      self.last_heartbeat_ts = Instant::now();
    }
  }

  pub fn is_connected(&self) -> bool {
    self.websocket_client.is_connected()
  }

  fn on_message(message: Message) {
    match message {
      Message::Binary(data) => {
        println!("{:?}", Packet::from_bytes(data));
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
  FailedToConnect,
}

