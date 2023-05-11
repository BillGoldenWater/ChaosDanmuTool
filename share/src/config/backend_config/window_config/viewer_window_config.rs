/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ViewerWindowConfig {
  #[serde(default = "x_default")]
  pub x: i32,
  #[serde(default = "y_default")]
  pub y: i32,
  #[serde(default = "width_default")]
  pub width: u32,
  #[serde(default = "height_default")]
  pub height: u32,
}

fn x_default() -> i32 {
  0
}

fn y_default() -> i32 {
  0
}

fn width_default() -> u32 {
  400
}

fn height_default() -> u32 {
  600
}
