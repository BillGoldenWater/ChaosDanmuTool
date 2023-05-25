/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ReceiverStatusUpdate {
  status: ReceiverStatus,
}

impl ReceiverStatusUpdate {
  pub fn new(status: ReceiverStatus) -> ReceiverStatusUpdate {
    ReceiverStatusUpdate { status }
  }
}

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ReceiverStatus {
  Close,
  Connecting,
  Connected,

  Error,
  Reconnecting,

  Interrupted,
}
