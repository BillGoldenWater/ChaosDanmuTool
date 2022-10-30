/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::command;

use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::location_info;

#[command]
pub async fn connect_room() {
  let result = DanmuReceiver::i().connect().await;
  if let Err(err) = result {
    rfd::MessageDialog::new()
      .set_title("错误")
      .set_level(rfd::MessageLevel::Error)
      .set_buttons(rfd::MessageButtons::Ok)
      .set_description(&format!("无法连接直播间.\n{:?}\n{}", err, location_info!()))
      .show();
  }
}

#[command]
pub async fn disconnect_room() {
  DanmuReceiver::i().disconnect().await;
}
