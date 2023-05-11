/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fmt::{Display, Formatter};

use crate::config::backend_config::BackendConfig;
use crate::config::frontend_config::FrontendConfig;

pub mod backend_config;
pub mod frontend_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
  #[serde(default = "backend_default")]
  pub backend: BackendConfig,
  #[serde(default = "frontend_default")]
  pub frontend: FrontendConfig,
}

fn backend_default() -> BackendConfig {
  serde_json::from_str("{}").unwrap()
}

fn frontend_default() -> FrontendConfig {
  serde_json::from_str("{}").unwrap()
}

impl Display for Config {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", serde_json::to_string(self).unwrap())
  }
}
