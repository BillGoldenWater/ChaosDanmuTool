/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/mainViewConfig/functionsConfig/")]
pub struct RoomConnectionConfig {
  #[serde(default = "connect_on_start_default")]
  #[serde(skip_serializing_if = "connect_on_start_skip_if")]
  connect_on_start: bool,
  #[serde(default = "auto_open_viewer_default")]
  #[serde(skip_serializing_if = "auto_open_viewer_skip_if")]
  auto_open_viewer: bool,
}

fn connect_on_start_default() -> bool {
  false
}

fn connect_on_start_skip_if(value: &bool) -> bool {
  *value == connect_on_start_default()
}

fn auto_open_viewer_default() -> bool {
  true
}

fn auto_open_viewer_skip_if(value: &bool) -> bool {
  *value == auto_open_viewer_default()
}
