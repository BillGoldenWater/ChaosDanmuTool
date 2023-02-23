/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/appCommand/"
)]
pub struct BiliBiliPacketParseError {
  message: String,
}

impl BiliBiliPacketParseError {
  pub fn new(message: String) -> BiliBiliPacketParseError {
    BiliBiliPacketParseError { message }
  }
}
