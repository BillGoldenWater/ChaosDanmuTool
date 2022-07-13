/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::config::config::frontend_config::main_view_config::MainViewConfig;
use crate::libs::config::config::frontend_config::viewer_view_config::ViewerViewConfig;

pub mod main_view_config;
pub mod viewer_view_config;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/")]
pub struct FrontendConfig {
  #[serde(default = "main_view_default")]
  #[serde(skip_serializing_if = "main_view_skip_if")]
  main_view: MainViewConfig,
  #[serde(default = "viewer_view_default")]
  #[serde(skip_serializing_if = "viewer_view_skip_if")]
  viewer_view: ViewerViewConfig,
}

//region main_view
fn main_view_default() -> MainViewConfig {
  serde_json::from_str("{}").unwrap()
}

fn main_view_skip_if(value: &MainViewConfig) -> bool {
  *value == main_view_default()
}
//endregion

//region viewer_view
fn viewer_view_default() -> ViewerViewConfig {
  serde_json::from_str("{}").unwrap()
}

fn viewer_view_skip_if(value: &ViewerViewConfig) -> bool {
  *value == viewer_view_default()
}
//endregion
