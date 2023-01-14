/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/backendConfig/windowConfig/"
)]
pub struct MainWindowConfig {
  #[serde(default = "placeholder_default")]
  #[serde(skip_serializing_if = "placeholder_skip_if")]
  pub placeholder: bool,
}

//region placeholder
fn placeholder_default() -> bool {
  true
}

fn placeholder_skip_if(value: &bool) -> bool {
  *value == placeholder_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
//endregion
