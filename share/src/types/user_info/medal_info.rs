/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::user_info_apply_updates;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MedalInfo {
  pub target_id: String,
  #[serde(default)]
  pub anchor_roomid: Option<u32>,
  #[serde(default)]
  pub anchor_name: Option<String>,
  #[serde(default)]
  pub medal_name: Option<String>,
}

impl MedalInfo {
  pub fn apply_update(&mut self, other: Self) -> bool {
    let mut modified = false;

    if self.target_id != other.target_id {
      self.target_id = other.target_id;
      modified = true;
    }

    user_info_apply_updates![
      other => self, modified;
      anchor_roomid,
      anchor_name,
      medal_name
    ];

    modified
  }
}
