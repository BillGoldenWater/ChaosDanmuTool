/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;
use serde_json::Value;

use crate::types::user_info::medal_info::MedalInfo;
use crate::types::bilibili::user_info::medal_info::MedalInfo as BiliBiliMedalInfo;
use crate::user_info_apply_updates;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MedalData {
  pub info: MedalInfo,
  pub is_lighted: Option<bool>,
  pub guard_level: Option<u8>,
  pub level: Option<u32>,

  pub color: Option<u32>,
  pub color_border: Option<u32>,
  pub color_start: Option<u32>,
  pub color_end: Option<u32>,
}

impl MedalData {
  pub fn from_danmu_raw(raw: &Value) -> Result<Self, FromRawError> {
    if let Some(arr) = raw.as_array() {
      if arr.is_empty() {
        return Err(FromRawError::EmptyInput);
      }
    }

    let medal_info = MedalInfo {
      target_id: raw[12].as_u64().map_or(String::new(), |it| it.to_string()),
      anchor_roomid: raw[3].as_u64().map(|it| it as u32),
      anchor_name: raw[2].as_str().map(|it| it.to_string()),
      medal_name: raw[1].as_str().map(|it| it.to_string()),
    };
    if raw[3].as_u64().is_none() {
      return Err(FromRawError::NoneAnchorRoomid);
    }

    let mut result = Self {
      info: medal_info,
      ..Default::default()
    };

    result.level = raw[0].as_u64().map(|it| it as u32);
    result.color = raw[4].as_i64().map(|it| it as u32);
    result.color_border = raw[7].as_i64().map(|it| it as u32);
    result.color_start = raw[8].as_i64().map(|it| it as u32);
    result.color_end = raw[9].as_i64().map(|it| it as u32);
    result.guard_level = raw[10].as_u64().map(|it| it as u8);
    result.is_lighted = raw[11].as_u64().map(|it| it != 0);

    Ok(result)
  }

  pub fn apply_update(&mut self, other: Self) -> bool {
    let mut modified = self.info.apply_update(other.info);

    user_info_apply_updates![
      other => self, modified;
      is_lighted,
      guard_level,
      level,

      color,
      color_border,
      color_start,
      color_end
    ];

    modified
  }
}

#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum FromRawError {
  #[error("unexpected none of anchor roomid")]
  NoneAnchorRoomid,
  #[error("empty input")]
  EmptyInput,
}

impl From<BiliBiliMedalInfo> for MedalData {
  fn from(value: BiliBiliMedalInfo) -> Self {
    Self {
      info: MedalInfo {
        target_id: value.target_id.to_string(),
        anchor_roomid: Some(value.anchor_roomid),
        anchor_name: Some(value.anchor_uname),
        medal_name: Some(value.medal_name),
      },

      is_lighted: Some(value.is_lighted == 1),
      guard_level: Some(value.guard_level),
      level: Some(value.medal_level),
      color: Some(value.medal_color as u32),
      color_border: Some(value.medal_color_border as u32),
      color_start: Some(value.medal_color_start as u32),
      color_end: Some(value.medal_color_end as u32),
    }
  }
}
