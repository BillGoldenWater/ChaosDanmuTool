/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::config::config::ALLOW_CONFIG_SKIP_IF;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/config/backendConfig/")]
pub struct UpdaterConfig {
  #[serde(default = "ignore_versions_default")]
  #[serde(skip_serializing_if = "ignore_versions_skip_if")]
  pub ignore_versions: Vec<String>,
}

fn ignore_versions_default() -> Vec<String> {
  vec![]
}

fn ignore_versions_skip_if(value: &Vec<String>) -> bool {
  *value == ignore_versions_default() && *ALLOW_CONFIG_SKIP_IF.read().unwrap()
}
