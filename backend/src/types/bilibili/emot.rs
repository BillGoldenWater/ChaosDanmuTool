/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::utils::url_utils::url_http_to_https;

#[derive(serde::Serialize, serde::Deserialize, Default, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../frontend/src/share/type/rust/bilibili/")]
pub struct Emot {
  #[serde(default)]
  pub emoji: String,
  #[serde(default)]
  pub url: String,
}

impl Emot {
  pub fn to_https(mut self) -> Self {
    self.url = url_http_to_https(&self.url);
    self
  }
}
