/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::functions_config::FunctionsConfig;
use crate::config::frontend_config::main_view_config::theme_config::ThemeConfig;
use crate::config::ALLOW_CONFIG_SKIP_IF;

pub mod functions_config;
pub mod theme_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/config/frontendConfig/"
)]
pub struct MainViewConfig {
  #[serde(default = "path_default")]
  #[serde(skip_serializing_if = "path_skip_if")]
  pub path: String,
  #[serde(default = "functions_default")]
  #[serde(skip_serializing_if = "functions_skip_if")]
  pub functions: FunctionsConfig,
  #[serde(default = "theme_default")]
  #[serde(skip_serializing_if = "theme_skip_if")]
  pub theme: ThemeConfig,
}

fn path_default() -> String {
  "chaos://app".to_string()
}

fn path_skip_if(value: &String) -> bool {
  *value == path_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

fn functions_default() -> FunctionsConfig {
  serde_json::from_str("{}").unwrap()
}

fn functions_skip_if(value: &FunctionsConfig) -> bool {
  *value == functions_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}

// region theme
fn theme_default() -> ThemeConfig {
  serde_json::from_str("{}").unwrap()
}

fn theme_skip_if(value: &ThemeConfig) -> bool {
  *value == theme_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion
