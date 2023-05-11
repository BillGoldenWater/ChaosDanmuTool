/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RoomConnectionConfig {
  #[serde(default = "connect_on_start_default")]
  pub connect_on_start: bool,
  #[serde(default = "auto_open_viewer_default")]
  pub auto_open_viewer: bool,
}

fn connect_on_start_default() -> bool {
  false
}

fn auto_open_viewer_default() -> bool {
  true
}
