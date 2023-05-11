/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TTSDanmuConfig {
  #[serde(default = "read_username_default")]
  pub read_username: bool,
  #[serde(default = "filter_duplicate_content_delay_default")]
  pub filter_duplicate_content_delay: i32,
}

fn read_username_default() -> bool {
  false
}

fn filter_duplicate_content_delay_default() -> i32 {
  30
}
