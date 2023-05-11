/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::Config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConfigUpdate {
  config: Config,
}

impl ConfigUpdate {
  pub fn new(config: Config) -> ConfigUpdate {
    ConfigUpdate { config }
  }
}
