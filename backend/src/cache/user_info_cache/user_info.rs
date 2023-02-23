/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::cache::user_info_cache::medal_data::MedalData;

#[macro_export]
macro_rules! user_info_apply_updates {
    ($other:expr => $self:expr, $modified:ident; $($name:ident),*) => {
      $(
        if $other.$name.is_some() && $self.$name != $other.$name {
          $self.$name = $other.$name;
          $modified = true;
        }
      )*
    };
}

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../frontend/src/share/type/rust/cache/userInfo/")]
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
  pub fn apply_update(&mut self, other: Self) -> bool {
    assert_eq!(
      self.uid, other.uid,
      "update when uid not eq {:?}\n{:?}",
      self, other
    );
    let mut modified = false;

    user_info_apply_updates![
      other => self, modified;
      name,
      user_level,
      face,
      face_frame,
      is_vip,
      is_svip,
      is_main_vip,
      is_manager,
      title,
      level_color,
      name_color
    ];

    if let Some(medal) = &mut self.medal {
      // self some
      modified |= if let Some(other) = other.medal {
        // other some
        medal.apply_update(other)
      } else {
        // other none
        self.medal = other.medal;
        true
      }
    } else if other.medal.is_some() {
      // self none, other some
      self.medal = other.medal;
      modified = true;
    }

    modified
  }
}
