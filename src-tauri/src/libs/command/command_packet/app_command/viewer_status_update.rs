/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/appCommand/")]
pub struct ViewerStatusUpdate {
  status: ViewerStatus,
}

impl ViewerStatusUpdate {
  pub fn new(status: ViewerStatus) -> ViewerStatusUpdate {
    ViewerStatusUpdate {
      status
    }
  }
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/command/commandPacket/appCommand/viewerStatusUpdate/")]
pub enum ViewerStatus {
  Open,
  Close,
}