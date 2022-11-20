/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::cache::user_info_cache::medal_data::MedalData;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/share/type/rust/cache/userInfo/")]
pub struct UserInfo {
  pub uid: String,
  #[serde(default)]
  pub name: Option<String>,
  #[serde(default)]
  pub user_level: Option<u32>,

  #[serde(default)]
  pub face: Option<String>,
  #[serde(default)]
  pub face_frame: Option<String>,

  #[serde(default)]
  pub is_vip: Option<bool>,
  #[serde(default)]
  pub is_svip: Option<bool>,
  #[serde(default)]
  pub is_main_vip: Option<bool>,
  #[serde(default)]
  pub is_manager: Option<bool>,

  #[serde(default)]
  pub title: Option<String>,
  #[serde(default)]
  pub level_color: Option<String>,
  #[serde(default)]
  pub name_color: Option<String>,

  #[serde(default)]
  pub medal: Option<MedalData>,
}

impl UserInfo {
  pub fn apply_update(&mut self, other: Self) {
    assert_eq!(
      self.uid, other.uid,
      "update when uid not eq {:?}\n{:?}",
      self, other
    );

    if other.name.is_some() {
      self.name = other.name;
    }
    if other.user_level.is_some() {
      self.user_level = other.user_level;
    }
    if other.face.is_some() {
      self.face = other.face;
    }
    if other.face_frame.is_some() {
      self.face_frame = other.face_frame;
    }
    if other.is_vip.is_some() {
      self.is_vip = other.is_vip;
    }
    if other.is_svip.is_some() {
      self.is_svip = other.is_svip;
    }
    if other.is_main_vip.is_some() {
      self.is_main_vip = other.is_main_vip;
    }
    if other.is_manager.is_some() {
      self.is_manager = other.is_manager;
    }
    if other.title.is_some() {
      self.title = other.title;
    }
    if other.level_color.is_some() {
      self.level_color = other.level_color;
    }
    if other.name_color.is_some() {
      self.name_color = other.name_color;
    }

    if let Some(medal) = &mut self.medal {
      if let Some(other) = other.medal {
        medal.apply_update(other)
      } else {
        self.medal = other.medal
      }
    } else {
      self.medal = other.medal
    }
  }
}
