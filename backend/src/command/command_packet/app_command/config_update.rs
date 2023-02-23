/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::Config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/appCommand/"
)]
pub struct ConfigUpdate {
  config: Config,
}

impl ConfigUpdate {
  pub fn new(config: Config) -> ConfigUpdate {
    ConfigUpdate { config }
  }
}
