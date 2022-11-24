/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
pub struct HttpServerConfig {
  #[serde(default = "port_default")]
  #[serde(skip_serializing_if = "port_skip_if")]
  pub port: u16,
}

fn port_default() -> u16 {
  25556
}

fn port_skip_if(value: &u16) -> bool {
  *value == port_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
