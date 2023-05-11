/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdaterConfig {
  #[serde(default = "ignore_versions_default")]
  pub ignore_versions: Vec<String>,
}

fn ignore_versions_default() -> Vec<String> {
  vec![]
}
