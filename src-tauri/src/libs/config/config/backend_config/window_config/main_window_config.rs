/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/windowConfig/")]
pub struct MainWindowConfig {
  #[serde(default = "use_acrylic_effect_default")]
  #[serde(skip_serializing_if = "use_acrylic_effect_skip_if")]
  use_acrylic_effect: bool,
}

fn use_acrylic_effect_default() -> bool {
  true
}

fn use_acrylic_effect_skip_if(value: &bool) -> bool {
  *value == use_acrylic_effect_default()
}

