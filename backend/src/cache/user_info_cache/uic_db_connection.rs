/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::collections::HashMap;

use itertools::Itertools;
use sqlx::{Row, SqliteConnection};

use chaos_danmu_tool_share::types::user_info::medal_data::MedalData;
use chaos_danmu_tool_share::types::user_info::medal_info::MedalInfo;
use chaos_danmu_tool_share::types::user_info::UserInfo;
use chaos_danmu_tool_share::utils::url_utils::url_http_to_https;

use crate::app_context::AppContext;
use crate::utils::db_utils;
use crate::utils::db_utils::create_db;

const FILE_NAME: &str = "userInfo.sqlite";

pub struct UicDbConnection {
  db: SqliteConnection,
}

impl UicDbConnection {
  pub async fn new() -> Self {
    let db_file = AppContext::i().cache_dir.join(FILE_NAME);

    Self {
      db: create_db(db_file, include_str!("sql/create_tables.sql")).await,
    }
  }

  pub async fn user_info_ins_rep<'value, I>(&mut self, data: I) -> UicDbResult<()>
  where
    I: IntoIterator<Item = &'value UserInfo>,
  {
    let data = data.into_iter().collect_vec();

    if data.iter().any(|it| it.medal.is_some()) {
      self
        .medal_data_ins_rep(
          data
            .iter()
            .filter_map(|it| Some((it.uid.as_str(), it.medal.as_ref()?))),
        )
        .await?;
    }

    db_utils::query_ins_rep_many(
      "user_info",
      r#"uid, name, userLevel, face, faceFrame, isVip, isSvip,
 isMainVip, isManager, title, levelColor, nameColor, hasMedal"#,
      data,
      |mut b, info: &'value UserInfo| {
        b.push_bind(&info.uid)
          .push_bind(&info.name)
          .push_bind(info.user_level)
          .push_bind(&info.face)
          .push_bind(&info.face_frame)
          .push_bind(info.is_vip)
          .push_bind(info.is_svip)
          .push_bind(info.is_main_vip)
          .push_bind(info.is_manager)
          .push_bind(&info.title)
          .push_bind(&info.level_color)
          .push_bind(&info.name_color)
          .push_bind(info.medal.is_some());
      },
    )
    .build()
    .execute(&mut self.db)
    .await?;

    Ok(())
  }

  pub async fn user_info_sel<'value, I>(&mut self, uid: I) -> UicDbResult<HashMap<String, UserInfo>>
  where
    I: IntoIterator<Item = &'value str>,
  {
    let uid = uid.into_iter().collect_vec();
    let mut medal_data = self.medal_data_sel(uid.iter().cloned()).await?;

    db_utils::query_sel_many("user_info", "uid", uid)
      .build()
      .fetch_all(&mut self.db)
      .await?
      .into_iter()
      .map(|row| {
        let uid: String = row.try_get("uid")?;
        let has_medal: bool = row.try_get("hasMedal")?;
        let medal = if has_medal {
          Some(
            medal_data
              .remove(&uid)
              .ok_or(UicDbError::FailedToGetMedalData(uid.clone()))?,
          )
        } else {
          None
        };

        Ok((
          uid.clone(),
          UserInfo {
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
          },
        ))
      })
      .collect()
  }

  pub async fn medal_data_ins_rep<'value, I>(&mut self, data: I) -> UicDbResult<()>
  where
    I: IntoIterator<Item = (&'value str, &'value MedalData)>,
  {
    let data = data.into_iter().collect_vec();
    self
      .medal_info_ins_rep(data.iter().map(|(_, d)| &d.info))
      .await?;

    db_utils::query_ins_rep_many(
      "medal_data",
      "uid, targetId, isLighted, guardLevel, level, color, colorBorder, colorEnd, colorStart",
      data,
      |mut b, (uid, d)| {
        b.push_bind(uid)
          .push_bind(&d.info.target_id)
          .push_bind(d.is_lighted)
          .push_bind(d.guard_level)
          .push_bind(d.level)
          .push_bind(d.color)
          .push_bind(d.color_border)
          .push_bind(d.color_end)
          .push_bind(d.color_start);
      },
    )
    .build()
    .execute(&mut self.db)
    .await?;
    Ok(())
  }

  pub async fn medal_data_sel<'value, I>(
    &mut self,
    uid: I,
  ) -> UicDbResult<HashMap<String, MedalData>>
  where
    I: IntoIterator<Item = &'value str>,
  {
    let medal_data_rows = db_utils::query_sel_many("medal_data", "uid", uid)
      .build()
      .fetch_all(&mut self.db)
      .await?;

    let target_ids = medal_data_rows
      .iter()
      .map(|row| {
        row
          .try_get::<&str, &'static str>("targetId")
          .map_err(UicDbError::from)
      })
      .collect::<UicDbResult<Vec<_>>>()?;

    let medal_info = self.medal_info_sel(target_ids).await?;

    medal_data_rows
      .iter()
      .map(|row| {
        let target_id = row
          .try_get::<&str, &'static str>("targetId")
          .map_err(UicDbError::from)?;
        let info = medal_info
          .get(target_id)
          .ok_or_else(|| UicDbError::FailedToGetMedalInfo(target_id.to_string()))?
          .clone();

        Ok((
          row.try_get("uid")?,
          MedalData {
            info,
            is_lighted: row.try_get("isLighted").ok(),
            guard_level: row.try_get("guardLevel").ok(),
            level: row.try_get("level").ok(),
            color: row.try_get("color").ok(),
            color_border: row.try_get("colorBorder").ok(),
            color_start: row.try_get("colorStart").ok(),
            color_end: row.try_get("colorEnd").ok(),
          },
        ))
      })
      .collect()
  }

  pub async fn medal_info_ins_rep<'value, I>(&mut self, data: I) -> UicDbResult<()>
  where
    I: IntoIterator<Item = &'value MedalInfo>,
  {
    db_utils::query_ins_rep_many(
      "medal_info",
      "targetId, anchorRoomid, anchorName, medalName",
      data,
      |mut b, d| {
        b.push_bind(&d.target_id)
          .push_bind(d.anchor_roomid)
          .push_bind(&d.anchor_name)
          .push_bind(&d.medal_name);
      },
    )
    .build()
    .execute(&mut self.db)
    .await?;
    Ok(())
  }

  pub async fn medal_info_sel<'value, I>(
    &mut self,
    target_id: I,
  ) -> UicDbResult<HashMap<String, MedalInfo>>
  where
    I: IntoIterator<Item = &'value str>,
  {
    db_utils::query_sel_many("medal_info", "targetId", target_id)
      .build()
      .fetch_all(&mut self.db)
      .await?
      .into_iter()
      .map(|row| {
        let target_id: String = row.try_get("targetId").map_err(UicDbError::from)?;
        Ok((
          target_id.clone(),
          MedalInfo {
            target_id,
            anchor_roomid: row.try_get("anchorRoomid").ok(),
            anchor_name: row.try_get("anchorName").ok(),
            medal_name: row.try_get("medalName").ok(),
          },
        ))
      })
      .collect()
  }
}

#[derive(thiserror::Error, Debug)]
pub enum UicDbError {
  #[error("database error: {0:?}")]
  SqlxError(#[from] sqlx::Error),
  #[error("failed to get medal_info, target_id: {0}")]
  FailedToGetMedalInfo(String),
  #[error("failed to get medal_data, uid: {0}")]
  FailedToGetMedalData(String),
}

pub type UicDbResult<R> = Result<R, UicDbError>;

// // fixme: remove before commit
// #[allow(unreachable_code)]
// async fn test() {
//   let mut c: UicDbConnection = todo!();
//
//   c.medal_info_sel(vec![String::new()].iter().map(|it| it.as_str()))
//     .await;
// }
