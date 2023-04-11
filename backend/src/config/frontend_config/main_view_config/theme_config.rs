/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::theme_config::theme_id::ThemeId;
use crate::config::ALLOW_CONFIG_SKIP_IF;

pub mod theme_id;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/config/frontendConfig/mainViewConfig/"
)]
pub struct ThemeConfig {
  #[serde(default = "theme_id_default")]
  #[serde(skip_serializing_if = "theme_id_skip_if")]
  pub theme_id: ThemeId,
  #[serde(default = "theme_color_default")]
  #[serde(skip_serializing_if = "theme_color_skip_if")]
  pub theme_color: String,
  #[serde(default = "follow_system_default")]
  #[serde(skip_serializing_if = "follow_system_skip_if")]
  pub follow_system: bool,
}

// region theme_id
fn theme_id_default() -> ThemeId {
  Default::default()
}

fn theme_id_skip_if(value: &ThemeId) -> bool {
  *value == theme_id_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

// region theme_color
fn theme_color_default() -> String {
  "hsl(200, 100%, 50%)".to_string()
}

fn theme_color_skip_if(value: &String) -> bool {
  *value == theme_color_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion

// region follow_system
fn follow_system_default() -> bool {
  true
}

fn follow_system_skip_if(value: &bool) -> bool {
  *value == follow_system_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
// endregion
