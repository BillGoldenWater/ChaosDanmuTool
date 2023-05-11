/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConfigManagerConfig {
  #[serde(default = "save_on_change_default")]
  pub save_on_change: bool,
  #[serde(default = "save_on_exit_default")]
  pub save_on_exit: bool,
}

fn save_on_change_default() -> bool {
  true
}

fn save_on_exit_default() -> bool {
  true
}
