/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuMergeConfig {
  #[serde(default = "interval_default")]
  pub interval: i32,
  #[serde(default = "merge_different_user_default")]
  pub merge_different_user: bool,
}

fn interval_default() -> i32 {
  30
}

fn merge_different_user_default() -> bool {
  true
}
