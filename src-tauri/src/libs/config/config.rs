/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::backend_config::BackendConfig;
use crate::libs::config::config::frontend_config::FrontendConfig;

pub mod backend_config;
pub mod frontend_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/")]
pub struct Config {
  #[serde(default = "backend_default")]
  #[serde(skip_serializing_if = "backend_skip_if")]
  backend: BackendConfig,
  #[serde(default = "frontend_default")]
  #[serde(skip_serializing_if = "frontend_skip_if")]
  frontend: FrontendConfig,
}

//region backend
fn backend_default() -> BackendConfig {
  serde_json::from_str("{}").unwrap()
}

fn backend_skip_if(value: &BackendConfig) -> bool {
  *value == backend_default()
}
//endregion

//region frontend
fn frontend_default() -> FrontendConfig {
  serde_json::from_str("{}").unwrap()
}

fn frontend_skip_if(value: &FrontendConfig) -> bool {
  *value == frontend_default()
}
//endregion
