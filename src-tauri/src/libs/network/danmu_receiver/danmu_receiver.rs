/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Instant;

use bytes::BytesMut;
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;

use crate::libs::network::api_request::danmu_server_info_getter::DanmuServerInfoGetter;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiverConnectError::{FailedToConnect, GettingServerInfoFailed};
use crate::libs::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::libs::network::websocket::websocket_connection::{WebSocketConnectError, WebSocketConnection};
use crate::{info};

lazy_static! {
  pub static ref DANMU_RECEIVER_STATIC_INSTANCE: Mutex<DanmuReceiver> = Mutex::new(DanmuReceiver::new(30));
}

pub struct DanmuReceiver {
  websocket_connection: WebSocketConnection,
  last_heartbeat_ts: Instant,

  heartbeat_interval: u32,
}

impl DanmuReceiver {
  fn new(heartbeat_interval: u32) -> DanmuReceiver {
    DanmuReceiver {
      websocket_connection: WebSocketConnection::new(),
      last_heartbeat_ts: Instant::now(),
      heartbeat_interval,
    }
  }

  pub async fn connect(room_id: i32) -> Result<(), DanmuReceiverConnectError> {
    let this = &mut *DANMU_RECEIVER_STATIC_INSTANCE.lock().await;

    // TODO: get actual room id
    // TODO: Status update: connecting
    let token_and_url_result =
      DanmuServerInfoGetter::get_token_and_url(room_id).await;

    if token_and_url_result.is_none() {
      return Err(GettingServerInfoFailed);
    }
    let token_and_url = token_and_url_result.unwrap();

    let connect_result =
      this.websocket_connection.connect(token_and_url.url.as_str()).await;

    if let Err(err) = connect_result {
      return Err(FailedToConnect(err));
    } else { // on open
      this.websocket_connection.send(Message::Binary(
        Packet::join(JoinPacketInfo {
          roomid: room_id,
          protover: 3,
          platform: "web".to_string(),
          key: token_and_url.token,
        }).pack().to_vec()
      )).await; // TODO: Status update: open
    }

    info!("room {} connected",room_id);
    Ok(())
  }

  pub async fn disconnect() {
    let this = &mut *DANMU_RECEIVER_STATIC_INSTANCE.lock().await;

    info!("disconnecting");
    this.websocket_connection.disconnect(None).await;
    info!("disconnected");
  }

  pub async fn tick() {
    let this = &mut *DANMU_RECEIVER_STATIC_INSTANCE.lock().await;

    let messages = this.websocket_connection.tick().await;
    for msg in messages {
      this.on_message(msg).await;
    }

    this.tick_heartbeat().await;
  }

  async fn tick_heartbeat(&mut self) {
    if self.last_heartbeat_ts.elapsed().as_secs() > self.heartbeat_interval as u64 {
      self.websocket_connection.send(Message::Binary(
        Packet::heartbeat().pack().to_vec()
      )).await;

      self.last_heartbeat_ts = Instant::now();
    }
  }

  pub async fn is_connected() -> bool {
    let this = &*DANMU_RECEIVER_STATIC_INSTANCE.lock().await;
    this.websocket_connection.is_connected()
  }

  pub async fn set_heartbeat_interval(heartbeat_interval: u32) {
    let this = &mut *DANMU_RECEIVER_STATIC_INSTANCE.lock().await;

    this.heartbeat_interval = heartbeat_interval;
  }

  async fn on_message(&self, message: Message) {
    match message { // TODO: Status update: close message
      Message::Binary(data) => {
        let packet = Packet::from_bytes(&mut BytesMut::from(data.as_slice()));
        info!("{:?}", packet);
        // CommandBroadcastServer::broadcast(Message::Text(format!("{:?}", packet))).await;
        // TODO: packet parse
      }
      _ => {
        info!("{:?}", message)
      }
    }
  }
}

#[derive(Debug)]
pub enum DanmuReceiverConnectError {
  GettingServerInfoFailed,
  FailedToConnect(WebSocketConnectError),
}


