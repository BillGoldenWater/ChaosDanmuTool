/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
pub struct HttpServerConfig {
  #[serde(default = "port_default")]
  #[serde(skip_serializing_if = "port_skip_if")]
  port: u16,
}

fn port_default() -> u16 {
  25525
}

fn port_skip_if(value: &u16) -> bool {
  *value == port_default()
}
