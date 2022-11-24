/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
export,
export_to = "../src/share/type/rust/command/commandPacket/appCommand/"
)]
pub struct GiftConfigUpdate {
  #[ts(type = "unknown")]
  gift_config_response: Value,
}

impl GiftConfigUpdate {
  pub fn new(gift_config_response: Value) -> GiftConfigUpdate {
    GiftConfigUpdate {
      gift_config_response,
    }
  }
}
