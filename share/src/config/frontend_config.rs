/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::MainViewConfig;
use crate::config::frontend_config::viewer_view_config::ViewerViewConfig;

pub mod main_view_config;
pub mod viewer_view_config;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FrontendConfig {
  #[serde(default = "main_view_default")]
  pub main_view: MainViewConfig,
  #[serde(default = "viewer_view_default")]
  pub viewer_view: Vec<ViewerViewConfig>,
}

fn main_view_default() -> MainViewConfig {
  serde_json::from_str("{}").unwrap()
}

fn viewer_view_default() -> Vec<ViewerViewConfig> {
  let mut default: ViewerViewConfig = serde_json::from_str("{}").unwrap();
  default.uuid = "93113675-999d-469c-a280-47ed2c5a09e4".to_string();
  default.default = true;
  default.name = "默认".to_string();
  vec![default]
}
