/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;
use sqlx::{Row, SqliteConnection};
use static_object::StaticObject;
use tokio::sync::Mutex;

use crate::libs::app_context::AppContext;
use crate::libs::cache::user_info_cache::medal_data::MedalData;
use crate::libs::cache::user_info_cache::medal_info::MedalInfo;
use crate::libs::cache::user_info_cache::user_info::UserInfo;
use crate::libs::utils::async_utils::run_blocking;
use crate::libs::utils::db_utils::create_db;
use crate::libs::utils::mutex_utils::a_lock;

pub mod medal_data;
pub mod medal_info;
pub mod user_info;

static FILE_NAME: &str = "userInfo.sqlite";

#[derive(StaticObject)]
pub struct UserInfoCache {
  db: Mutex<SqliteConnection>,
}

impl UserInfoCache {
  fn new() -> Self {
    let db_file = AppContext::i().cache_dir.join(FILE_NAME);

    let db = run_blocking(create_db(
      db_file,
      r#"
create table if not exists user_info
(
    uid        text not null
        constraint user_info_pk
            primary key,
    name       text,
    userLevel  integer,

    face       text,
    faceFrame  text,

    isVip      integer,
    isSvip     integer,
    isMainVip  integer,
    isManager  integer,

    title      text,
    levelColor text,
    nameColor  text,

    hasMedal   integer
);
create table if not exists medal_info
(
    anchorRoomid integer not null
        constraint medal_info_pk
            primary key,
    anchorName   text,
    medalName    text
);
create table if not exists medal_data
(
    uid          text not null
        constraint medal_data_pk
            primary key,
    anchorRoomid integer,
    isLighted    integer default 0,
    guardLevel   integer,
    color        INTEGER,
    colorBorder  INTEGER,
    colorEnd     INTEGER,
    colorStart   INTEGER,
    level        integer
);
"#,
    ));

    Self { db: Mutex::new(db) }
  }

  pub async fn update_and_get(&mut self, info: UserInfo) -> UserInfo {
    let cached = self.get(&info.uid).await;

    if let Some(mut cached) = cached {
      cached.apply_update(info);
      self.insert_or_replace(&cached).await;
      cached
    } else {
      self.insert_or_replace(&info).await;
      info
    }
  }

  pub async fn update(&mut self, info: UserInfo) {
    self.update_and_get(info).await;
  }

  async fn insert_or_replace(&mut self, info: &UserInfo) {
    static SQL: &str = r#"
insert or replace into user_info (uid, name, userLevel, face, faceFrame, isVip, isSvip, isMainVip, isManager, title, levelColor,
                       nameColor, hasMedal)
values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    "#;

    if let Some(medal) = &info.medal {
      let result = self.insert_or_replace_medal_data(&info.uid, medal).await;
      if let Err(err) = result {
        error!("failed to insert or replace medal data \n{medal:?}\n{err:?}");
        return;
      }
    }

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(SQL)
      .bind(&info.uid)
      .bind(&info.name)
      .bind(&info.user_level)
      .bind(&info.face)
      .bind(&info.face_frame)
      .bind(&info.is_vip)
      .bind(&info.is_svip)
      .bind(&info.is_main_vip)
      .bind(&info.is_manager)
      .bind(&info.title)
      .bind(&info.level_color)
      .bind(&info.name_color)
      .bind(info.medal.is_some())
      .execute(&mut *db)
      .await;
    if let Err(err) = result {
      error!("failed to insert or replace user_info \n{info:?}\n{err:?}");
    }
  }

  pub async fn get(&mut self, uid: &str) -> Option<UserInfo> {
    static SQL: &str = "select * from user_info where uid = ?;";

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(SQL).bind(uid).fetch_all(&mut *db).await;
    drop(db);

    if let Ok(result) = result {
      if !result.is_empty() {
        let row = &result[0];
        let uid: String = row.get("uid");
        let has_medal: bool = row.get("hasMedal");

        let medal = if has_medal {
          let medal_result = self.get_medal_data(&uid).await;
          if let Ok(medal) = medal_result {
            Some(medal)
          } else {
            if let Err(UserInfoCacheError::Empty) = medal_result {
            } else {
              error!(
                "failed to get medal \n{err:?}",
                err = medal_result.unwrap_err()
              )
            }
            None
          }
        } else {
          None
        };

        Some(UserInfo {
          uid,
          name: row.try_get("name").ok(),
          user_level: row.try_get("userLevel").ok(),
          face: row.try_get("face").ok(),
          face_frame: row.try_get("faceFrame").ok(),
          is_vip: row.try_get("isVip").ok(),
          is_svip: row.try_get("isSvip").ok(),
          is_main_vip: row.try_get("isMainVip").ok(),
          is_manager: row.try_get("isManager").ok(),
          title: row.try_get("title").ok(),
          level_color: row.try_get("levelColor").ok(),
          name_color: row.try_get("nameColor").ok(),
          medal,
        })
      } else {
        None
      }
    } else {
      if let Err(err) = result {
        error!("failed to get user_info {uid}\n{err:?}");
      }
      None
    }
  }

  async fn insert_or_replace_medal_data(&mut self, uid: &str, data: &MedalData) -> Result<()> {
    static SQL: &str = r#"
insert or replace into medal_data (uid, anchorRoomid, isLighted, guardLevel, color, colorBorder, colorStart, colorEnd, level)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);
"#;

    self.insert_or_replace_medal_info(&data.info).await?;

    let mut db = a_lock(&self.db).await;

    sqlx::query(SQL)
      .bind(uid)
      .bind(data.info.anchor_roomid)
      .bind(data.is_lighted)
      .bind(data.guard_level)
      .bind(data.color)
      .bind(data.color_border)
      .bind(data.color_start)
      .bind(data.color_end)
      .bind(data.level)
      .execute(&mut *db)
      .await?;

    Ok(())
  }

  async fn get_medal_data(&mut self, uid: &str) -> Result<MedalData> {
    static SQL: &str = "select * from medal_data where uid = ?;";

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(SQL).bind(uid).fetch_all(&mut *db).await?;
    drop(db);

    if !result.is_empty() {
      let row = &result[0];

      Ok(MedalData {
        info: self.get_medal_info(row.get("anchorRoomid")).await?,
        is_lighted: row.try_get("isLighted").ok(),
        guard_level: row.try_get("guardLevel").ok(),
        level: row.try_get("level").ok(),
        color: row.try_get("color").ok(),
        color_border: row.try_get("colorBorder").ok(),
        color_start: row.try_get("colorStart").ok(),
        color_end: row.try_get("colorEnd").ok(),
      })
    } else {
      Err(UserInfoCacheError::Empty)
    }
  }

  async fn insert_or_replace_medal_info(&mut self, info: &MedalInfo) -> Result<()> {
    static SQL: &str =
      "insert or replace into medal_info (anchorRoomid, anchorName, medalName) values (?, ?, ?);";

    let mut db = a_lock(&self.db).await;

    sqlx::query(SQL)
      .bind(info.anchor_roomid)
      .bind(&info.anchor_name)
      .bind(&info.medal_name)
      .execute(&mut *db)
      .await?;

    Ok(())
  }

  async fn get_medal_info(&mut self, anchor_roomid: u32) -> Result<MedalInfo> {
    static SQL: &str = "select * from medal_info where anchorRoomid = ?;";

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(SQL)
      .bind(anchor_roomid)
      .fetch_all(&mut *db)
      .await?;
    drop(db);

    if !result.is_empty() {
      let row = &result[0];
      Ok(MedalInfo {
        anchor_roomid: row.get("anchorRoomid"),
        anchor_name: row.try_get("anchorName").ok(),
        medal_name: row.try_get("medalName").ok(),
      })
    } else {
      Err(UserInfoCacheError::Empty)
    }
  }
}

#[derive(thiserror::Error, Debug)]
pub enum UserInfoCacheError {
  #[error("{0:?}")]
  SqlxError(#[from] sqlx::Error),
  #[error("empty result")]
  Empty,
}

type Result<R> = std::result::Result<R, UserInfoCacheError>;
