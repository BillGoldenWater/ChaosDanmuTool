/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StatusBarComponentConfig {
  #[serde(default = "show_default")]
  pub show: bool,
  #[serde(default = "format_number_default")]
  pub format_number: bool,
}

fn show_default() -> bool {
  true
}

fn format_number_default() -> bool {
  true
}
