/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/")]
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
  pub fn empty() -> EmojiData {
    EmojiData {
      id: 0,
      text: "".to_string(),
      url: "".to_string(),
      height: 0,
      width: 0,
    }
  }

  pub fn parse(str: &str) -> Result<EmojiData, serde_json::Error> {
    serde_json::from_str(str)
  }
}
