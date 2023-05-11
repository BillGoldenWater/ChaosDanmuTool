/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::functions_config::FunctionsConfig;
use crate::config::frontend_config::main_view_config::theme_config::ThemeConfig;

pub mod functions_config;
pub mod theme_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MainViewConfig {
  #[serde(default = "path_default")]
  pub path: String,
  #[serde(default = "functions_default")]
  pub functions: FunctionsConfig,
  #[serde(default = "theme_default")]
  pub theme: ThemeConfig,
}

fn path_default() -> String {
  "chaos://app".to_string()
}

fn functions_default() -> FunctionsConfig {
  serde_json::from_str("{}").unwrap()
}

fn theme_default() -> ThemeConfig {
  serde_json::from_str("{}").unwrap()
}
