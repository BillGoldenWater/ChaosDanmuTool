/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::iter::once;

use itertools::Itertools;
use log::error;
use static_object::StaticObject;
use tokio::sync::Mutex;

use chaos_danmu_tool_share::types::user_info::UserInfo;

use crate::cache::user_info_cache::uic_db_connection::UicDbConnection;
use crate::utils::async_utils::run_blocking;

pub mod uic_db_connection;

#[derive(StaticObject)]
pub struct UserInfoCache {
  db: Mutex<UicDbConnection>,
}

impl UserInfoCache {
  fn new() -> Self {
    Self {
      db: Mutex::new(run_blocking(UicDbConnection::new())),
    }
  }

  pub async fn update_many(&mut self, data: Vec<UserInfo>) -> UicResult<()> {
    if data.is_empty() {
      return Ok(());
    }

    let mut db = self.db.lock().await;

    let mut cached = db
      .user_info_sel(data.iter().map(|it| it.uid.as_str()))
      .await?;

    let updated_data = data
      .into_iter()
      .map(|it| {
        let cached = cached.remove(&it.uid);
        if let Some(mut cached) = cached {
          cached.apply_update(it);
          cached
        } else {
          it
        }
      })
      .collect_vec();
    db.user_info_ins_rep(updated_data.iter()).await?;
    Ok(())
  }

  pub async fn get(&mut self, uid: &str) -> UicResult<Option<UserInfo>> {
    let mut db = self.db.lock().await;
    let mut result = db.user_info_sel(once(uid)).await?;
    Ok(result.remove(uid))
  }
}

#[derive(thiserror::Error, Debug)]
pub enum UicError {
  #[error("{0:?}")]
  UicDbError(#[from] uic_db_connection::UicDbError),
}

type UicResult<R> = Result<R, UicError>;
