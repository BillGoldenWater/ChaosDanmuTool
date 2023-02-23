/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;
use serde::Serialize;
use std::sync::{Mutex, RwLock};

use crate::config::config::backend_config::BackendConfig;
use crate::config::config::frontend_config::FrontendConfig;

pub mod backend_config;
pub mod frontend_config;

lazy_static! {
  pub static ref ALLOW_CONFIG_SKIP_IF: RwLock<bool> = RwLock::new(false);
  pub static ref ALLOW_CONFIG_SKIP_IF_LOCK: Mutex<bool> = Mutex::new(false);
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../frontend/src/share/type/rust/config/")]
pub struct Config {
  #[serde(default = "backend_default")]
  #[serde(skip_serializing_if = "backend_skip_if")]
  pub backend: BackendConfig,
  #[serde(default = "frontend_default")]
  #[serde(skip_serializing_if = "frontend_skip_if")]
  pub frontend: FrontendConfig,
}

//region backend
fn backend_default() -> BackendConfig {
  serde_json::from_str("{}").unwrap()
}

fn backend_skip_if(value: &BackendConfig) -> bool {
  *value == backend_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

//region frontend
fn frontend_default() -> FrontendConfig {
  serde_json::from_str("{}").unwrap()
}

fn frontend_skip_if(value: &FrontendConfig) -> bool {
  *value == frontend_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion

pub fn serialize_config<T: Serialize>(config: &T, use_skip_if: bool) -> String {
  let lock = ALLOW_CONFIG_SKIP_IF_LOCK.lock().unwrap();

  let result = {
    {
      *ALLOW_CONFIG_SKIP_IF.write().unwrap() = use_skip_if
    }
    serde_json::to_string(config)
  };

  drop(lock);

  if let Err(err) = &result {
    error!("error when serialize config {}", err);
  }

  result.unwrap_or_else(|_| "{}".to_string())
}

#[cfg(test)]
mod test {
  use crate::config::config::frontend_config::viewer_view_config::ViewerViewConfig;
  use crate::config::config::{serialize_config, Config};

  #[test]
  fn write_default_config() {
    let default_config: String =
      serialize_config(&serde_json::from_str::<Config>("{}").unwrap(), false);

    std::fs::write(
      "../frontend/src/share/type/rust/config/defaultConfig.json",
      default_config,
    )
    .expect("Failed write default config.");
  }

  #[test]
  fn write_default_viewer_config() {
    let default_viewer_config: String = serialize_config(
      &serde_json::from_str::<ViewerViewConfig>("{}").unwrap(),
      false,
    );

    std::fs::write(
      "../frontend/src/share/type/rust/config/defaultViewerConfig.json",
      default_viewer_config,
    )
    .expect("Failed write viewer default config.");
  }
}
