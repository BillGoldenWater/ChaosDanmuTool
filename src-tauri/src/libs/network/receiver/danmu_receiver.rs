/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::network::websocket::websocket_client::WebSocketClient;

pub struct DanmuReceiver {
  websocket_client: WebSocketClient,
}

impl DanmuReceiver {
  pub fn new() -> DanmuReceiver {
    DanmuReceiver {
      websocket_client: WebSocketClient::new(|_message| {}),
    }
  }

  pub async fn connect(&mut self) -> bool {
    self.websocket_client.connect("");



    true
  }
}

