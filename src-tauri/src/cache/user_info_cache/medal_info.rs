/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::user_info_apply_updates;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Eq, Debug, Clone)]
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
  pub fn apply_update(&mut self, other: Self) -> bool {
    let mut modified = false;

    if self.anchor_roomid != other.anchor_roomid {
      self.anchor_roomid = other.anchor_roomid;
      modified = true;
    }

    user_info_apply_updates![
      other => self, modified;
      anchor_name,
      medal_name
    ];

    modified
  }
}
