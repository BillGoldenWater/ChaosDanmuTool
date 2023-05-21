/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chaos_danmu_tool_share::command_packet::app_command::user_info_update::UserInfoUpdate;
use chaos_danmu_tool_share::types::user_info::medal_data::MedalData;
use chaos_danmu_tool_share::types::user_info::medal_info::MedalInfo;
use chaos_danmu_tool_share::types::user_info::UserInfo;
use chaos_danmu_tool_share::utils::url_utils::url_http_to_https;
use log::error;
use sqlx::{Row, SqliteConnection};
use static_object::StaticObject;
use tokio::sync::Mutex;

use crate::app_context::AppContext;
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::utils::async_utils::run_blocking;
use crate::utils::db_utils::create_db;
use crate::utils::mutex_utils::a_lock;

static FILE_NAME: &str = "userInfo.sqlite";

#[derive(StaticObject)]
pub struct UserInfoCache {
  db: Mutex<SqliteConnection>,
}

impl UserInfoCache {
  fn new() -> Self {
    let db_file = AppContext::i().cache_dir.join(FILE_NAME);

    let db = run_blocking(create_db(db_file, include_str!("sql/create_tables.sql")));

    Self { db: Mutex::new(db) }
  }

  pub async fn update_and_get(&mut self, info: UserInfo) -> UserInfo {
    let cached = self.get(&info.uid).await;

    if let Some(mut cached) = cached {
      let modified = cached.apply_update(info);
      if modified {
        self.insert_or_replace(&cached).await;
      }
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
    CommandBroadcastServer::i()
      .broadcast_cmd(UserInfoUpdate::new(info.clone()).into())
      .await;

    if let Some(medal) = &info.medal {
      let result = self.insert_or_replace_medal_data(&info.uid, medal).await;
      if let Err(err) = result {
        error!("failed to insert or replace medal data \n{medal:?}\n{err:?}");
        return;
      }
    }

    let mut db = a_lock("uic_db",&self.db).await;

    let result = sqlx::query(include_str!("sql/user_info_ins_rep.sql"))
      .bind(&info.uid)
      .bind(&info.name)
      .bind(info.user_level)
      .bind(&info.face)
      .bind(&info.face_frame)
      .bind(info.is_vip)
      .bind(info.is_svip)
      .bind(info.is_main_vip)
      .bind(info.is_manager)
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

    let mut db = a_lock("uic_db",&self.db).await;

    let result = sqlx::query(SQL).bind(uid).fetch_all(&mut *db).await;
    drop(db);

    if let Ok(result) = result {
      if !result.is_empty() {
        let row = &result[0];
        let uid: String = row.try_get("uid").ok()?;
        let has_medal: bool = row.try_get("hasMedal").ok()?;

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
          face: row.try_get("face").ok().map(url_http_to_https),
          face_frame: row.try_get("faceFrame").ok().map(url_http_to_https),
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
    self.insert_or_replace_medal_info(&data.info).await?;

    let mut db = a_lock("uic_db",&self.db).await;

    sqlx::query(include_str!("sql/medal_data_ins_rep.sql"))
      .bind(uid)
      .bind(&data.info.target_id)
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
    let mut db = a_lock("uic_db",&self.db).await;

    let result = sqlx::query(include_str!("sql/medal_data_sel.sql"))
      .bind(uid)
      .fetch_all(&mut *db)
      .await?;
    drop(db);

    if !result.is_empty() {
      let row = &result[0];

      Ok(MedalData {
        info: self.get_medal_info(row.try_get("targetId")?).await?,
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
    let mut db = a_lock("uic_db",&self.db).await;

    sqlx::query(include_str!("sql/medal_info_ins_rep.sql"))
      .bind(&info.target_id)
      .bind(info.anchor_roomid)
      .bind(&info.anchor_name)
      .bind(&info.medal_name)
      .execute(&mut *db)
      .await?;

    Ok(())
  }

  async fn get_medal_info(&mut self, target_id: String) -> Result<MedalInfo> {
    let mut db = a_lock("uic_db",&self.db).await;

    let result = sqlx::query(include_str!("sql/medal_info_sel.sql"))
      .bind(&target_id)
      .fetch_all(&mut *db)
      .await?;
    drop(db);

    if !result.is_empty() {
      let row = &result[0];
      Ok(MedalInfo {
        target_id: row.try_get("targetId")?,
        anchor_roomid: row.try_get("anchorRoomid").ok(),
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
