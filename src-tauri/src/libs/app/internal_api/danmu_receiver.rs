/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::command;

use crate::dialog_notice;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;

#[command]
pub async fn connect_room() {
  let result = DanmuReceiver::i().connect().await;
  if let Err(err) = result {
    dialog_notice!(@error raw, format!("无法连接直播间.\n{:?}", err));
  }
}

#[command]
pub async fn disconnect_room() {
  DanmuReceiver::i().disconnect().await;
}
