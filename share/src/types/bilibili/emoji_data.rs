/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

use crate::utils::url_utils::url_http_to_https;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EmojiData {
  #[serde(default)]
  id: i32,
  #[serde(default)]
  text: String,
  #[serde(default)]
  url: String,
  #[serde(default)]
  height: i32,
  #[serde(default)]
  width: i32,
  // unknown
  // perm: i32,
  // emoticon_unique: String,
  // in_player_area: i64,
  // bulge_display: i64,
  // is_dynamic: i64,
}

impl EmojiData {
  pub fn parse(str: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(str).map(Self::to_https)
  }

  pub fn from_raw(raw: &Value) -> Result<Self, serde_json::Error> {
    serde_json::from_value::<Self>(raw.clone()).map(Self::to_https)
  }

  pub fn to_https(mut self) -> Self {
    self.url = url_http_to_https(&self.url);
    self
  }
}
