/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MainWindowConfig {
  #[serde(default = "placeholder_default")]
  pub placeholder: bool,
}

fn placeholder_default() -> bool {
  true
}
