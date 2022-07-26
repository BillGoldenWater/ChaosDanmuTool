/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/bilibili/")]
pub struct EmojiData {
  id: i32,
  text: String,
  url: String,
  height: i32,
  width: i32,

  // unknown
  perm: i32,
  emoticon_unique: String,
  in_player_area: i64,
  bulge_display: i64,
  is_dynamic: i64,
}