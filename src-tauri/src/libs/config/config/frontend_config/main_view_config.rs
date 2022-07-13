/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::frontend_config::main_view_config::functions_config::FunctionsConfig;

pub mod functions_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/frontendConfig/")]
pub struct MainViewConfig {
  #[serde(default = "path_default")]
  #[serde(skip_serializing_if = "path_skip_if")]
  path: String,
  #[serde(default = "functions_default")]
  #[serde(skip_serializing_if = "functions_skip_if")]
  functions: FunctionsConfig,
}

fn path_default() -> String {
  "".to_string()
}

fn path_skip_if(value: &String) -> bool {
  *value == path_default()
}


fn functions_default() -> FunctionsConfig {
  serde_json::from_str("{}").unwrap()
}

fn functions_skip_if(value: &FunctionsConfig) -> bool {
  *value == functions_default()
}
