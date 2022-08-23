/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/command/commandPacket/appCommand/"
)]
pub struct ReceiverStatusUpdate {
  status: ReceiverStatus,
}

impl ReceiverStatusUpdate {
  pub fn new(status: ReceiverStatus) -> ReceiverStatusUpdate {
    ReceiverStatusUpdate { status }
  }
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/command/commandPacket/appCommand/receiverStatusUpdate/"
)]
pub enum ReceiverStatus {
  Close,
  Connecting,
  Connected,

  Error,
  Reconnecting,

  Interrupted,
}
