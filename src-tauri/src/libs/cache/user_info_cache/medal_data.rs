/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;
use serde_json::Value;

use crate::libs::cache::user_info_cache::medal_info::MedalInfo;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/cache/userInfo/")]
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
  pub fn from_raw(raw: &Value) -> Result<Self, FromRawError> {
    if let Some(arr) = raw.as_array() {
      if arr.is_empty() {
        return Err(FromRawError::EmptyInput);
      }
    }

    let medal_info = MedalInfo {
      anchor_roomid: raw[3].as_u64().unwrap_or(0) as u32,
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

  pub fn apply_update(&mut self, other: Self) {
    self.info.apply_update(other.info);

    if other.is_lighted.is_some() {
      self.is_lighted = other.is_lighted;
    }
    if other.guard_level.is_some() {
      self.guard_level = other.guard_level;
    }
    if other.level.is_some() {
      self.level = other.level;
    }
    if other.color.is_some() {
      self.color = other.color;
    }
    if other.color_border.is_some() {
      self.color_border = other.color_border;
    }
    if other.color_end.is_some() {
      self.color_end = other.color_end;
    }
    if other.color_start.is_some() {
      self.color_start = other.color_start;
    }
  }
}

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum FromRawError {
  #[error("unexpected none of anchor roomid")]
  NoneAnchorRoomid,
  #[error("empty input")]
  EmptyInput,
}
