/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use once_cell::sync::Lazy;
use serde::Serialize;
use serde_wasm_bindgen::Serializer;
use wasm_bindgen::prelude::*;

use crate::command_packet::CommandPacket;
use crate::config::frontend_config::viewer_view_config::ViewerViewConfig;
use crate::config::Config;
use crate::types::user_info::UserInfo;

static SERIALIZER: Lazy<Serializer> =
  Lazy::new(|| Serializer::new().serialize_large_number_types_as_bigints(true));

#[wasm_bindgen]
pub fn deserialize_command_packet(value: &str) -> JsValue {
  serde_json::from_str::<CommandPacket>(value)
    .unwrap()
    .serialize(&*SERIALIZER)
    .unwrap()
}

#[wasm_bindgen]
pub fn deserialize_config(value: &str) -> JsValue {
  serde_json::from_str::<Config>(value)
    .unwrap()
    .serialize(&*SERIALIZER)
    .unwrap()
}

#[wasm_bindgen]
pub fn deserialize_viewer_config(value: &str) -> JsValue {
  serde_json::from_str::<ViewerViewConfig>(value)
    .unwrap()
    .serialize(&*SERIALIZER)
    .unwrap()
}

#[wasm_bindgen]
pub fn deserialize_user_info(value: &str) -> JsValue {
  serde_json::from_str::<UserInfo>(value)
    .unwrap()
    .serialize(&*SERIALIZER)
    .unwrap()
}

#[wasm_bindgen]
pub fn get_default_user_info() -> JsValue {
  static DEFAULT: Lazy<UserInfo> = Lazy::new(|| {
    UserInfo {
      uid: "".to_string(),
      name: Some("\u{200B}".to_string()), // Zero-width space
      user_level: None,
      face: Some("https://i0.hdslb.com/bfs/face/member/noface.jpg".to_string()),
      face_frame: None,
      is_vip: None,
      is_svip: None,
      is_main_vip: None,
      is_manager: None,
      title: None,
      level_color: None,
      name_color: None,
      medal: None,
    }
  });

  serde_wasm_bindgen::to_value(&*DEFAULT).unwrap()
}

#[wasm_bindgen]
pub fn wasm_init() {
  console_error_panic_hook::set_once();

  let log_level = if cfg!(debug_assertions) {
    log::Level::Debug
  } else {
    log::Level::Info
  };
  console_log::init_with_level(log_level).expect("error initializing logger");
}
