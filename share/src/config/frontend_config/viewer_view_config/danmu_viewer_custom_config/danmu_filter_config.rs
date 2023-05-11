/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DanmuFilterConfig {
  #[serde(default = "type_blacklist_default")]
  pub type_blacklist: Vec<String>,
  #[serde(default = "content_blacklist_default")]
  pub content_blacklist: Vec<String>,
}

fn type_blacklist_default() -> Vec<String> {
  vec![]
}

fn content_blacklist_default() -> Vec<String> {
  vec![]
}
