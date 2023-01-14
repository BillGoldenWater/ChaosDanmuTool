/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../src/share/type/rust/config/frontendConfig/mainViewConfig/themeConfig/"
)]
pub enum ThemeId {
  #[default]
  Dark,
  Light,
}
