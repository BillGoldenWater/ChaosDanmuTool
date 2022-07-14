/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::sync::{Mutex, RwLock};

use crate::libs::config::config::backend_config::BackendConfig;
use crate::libs::config::config::frontend_config::FrontendConfig;

pub mod backend_config;
pub mod frontend_config;

pub static INTERNAL_VIEWER_UUID: &str = "93113675-999d-469c-a280-47ed2c5a09e4";
lazy_static! {
  pub static ref ALLOW_CONFIG_SKIP_IF: RwLock<bool> = RwLock::new(false);
  pub static ref ALLOW_CONFIG_SKIP_IF_LOCK: Mutex<bool> = Mutex::new(false);
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/")]
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

pub fn serialize_config(config: &Config, use_skip_if: bool) -> String {
  let _ = &*ALLOW_CONFIG_SKIP_IF_LOCK.lock().unwrap();
  { *ALLOW_CONFIG_SKIP_IF.write().unwrap() = use_skip_if; }
  serde_json::to_string(config).unwrap_or("{}".to_string())
}

#[cfg(test)]
mod test {
  use serde_json::{json, Value};

  use crate::libs::config::config::{INTERNAL_VIEWER_UUID, serialize_config};

  #[test]
  fn write_default_uuids() {
    let default_uuids: Value = json!({
      "internalViewerUUID": INTERNAL_VIEWER_UUID
    });

    std::fs::write(
      "../src/share/type/rust/config/viewerDefaultUuids.json",
      serde_json::to_string(&default_uuids).unwrap(),
    ).expect("Failed write default uuids.");
  }

  #[test]
  fn write_default_config() {
    let default_config: String = serialize_config(
      &serde_json::from_str("{}").unwrap(),
      false,
    );

    std::fs::write(
      "../src/share/type/rust/config/defaultConfig.json",
      default_config,
    ).expect("Failed write default config.");
  }
}

