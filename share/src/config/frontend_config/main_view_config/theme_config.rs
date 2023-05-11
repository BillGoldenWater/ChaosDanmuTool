/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::frontend_config::main_view_config::theme_config::theme_id::ThemeId;

pub mod theme_id;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ThemeConfig {
  #[serde(default = "theme_id_default")]
  pub theme_id: ThemeId,
  #[serde(default = "theme_color_default")]
  pub theme_color: String,
  #[serde(default = "follow_system_default")]
  pub follow_system: bool,
}

fn theme_id_default() -> ThemeId {
  Default::default()
}

fn theme_color_default() -> String {
  "hsl(200, 100%, 50%)".to_string()
}

fn follow_system_default() -> bool {
  true
}
