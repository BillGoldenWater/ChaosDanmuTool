/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;

#[derive(serde::Serialize, serde::Deserialize, Default, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/bilibiliCommand/giftMessage/"
)]
pub enum CoinType {
  #[default]
  Sliver,
  Gold,
}

impl From<String> for CoinType {
  fn from(value: String) -> Self {
    match value.as_ref() {
      "gold" => Self::Gold,
      "silver" => Self::Sliver,
      _ => {
        error!("unknown coin_type: {value}");
        Default::default()
      }
    }
  }
}
