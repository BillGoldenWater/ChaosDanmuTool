/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
pub struct ConfigManagerConfig {
  #[serde(default = "save_on_change_default")]
  #[serde(skip_serializing_if = "save_on_change_skip_if")]
  save_on_change: bool,
  #[serde(default = "save_on_exit_default")]
  #[serde(skip_serializing_if = "save_on_exit_skip_if")]
  save_on_exit: bool,
}

fn save_on_change_default() -> bool {
  true
}

fn save_on_change_skip_if(value: &bool) -> bool {
  *value == save_on_change_default()
}

fn save_on_exit_default() -> bool {
  true
}

fn save_on_exit_skip_if(value: &bool) -> bool {
  *value == save_on_exit_default()
}
