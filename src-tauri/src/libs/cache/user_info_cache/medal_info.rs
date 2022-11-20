/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/cache/userInfo/")]
pub struct MedalInfo {
  pub anchor_roomid: u32,
  #[serde(default)]
  pub anchor_name: Option<String>,
  #[serde(default)]
  pub medal_name: Option<String>,
}

impl MedalInfo {
  pub fn apply_update(&mut self, other: Self) {
    if self.anchor_roomid != other.anchor_roomid {
      self.anchor_roomid = other.anchor_roomid;
    }

    if other.anchor_name.is_some() {
      self.anchor_name = other.anchor_name;
    }
    if other.medal_name.is_some() {
      self.medal_name = other.medal_name;
    }
  }
}
