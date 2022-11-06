/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chrono::Utc;
use log::{error, LevelFilter};
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection, Row, SqliteConnection};
use tauri::api::path::app_dir;
use tokio::sync::Mutex;

use crate::libs::app_context::tauri_config;
use crate::libs::command::command_packet;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::utils::async_utils::run_blocking;
use crate::libs::utils::mutex_utils::a_lock;

static FILE_NAME: &str = "commandHistory.sqlite";

#[derive(static_object::StaticObject)]
pub struct CommandHistoryManager {
  db: Mutex<SqliteConnection>,
  session_id: Mutex<String>,
}

impl CommandHistoryManager {
  fn new() -> Self {
    let tauri_config = tauri_config();
    let db_file = app_dir(&tauri_config).unwrap().join(FILE_NAME);
    let mut options = SqliteConnectOptions::new()
      .filename(db_file)
      .create_if_missing(true);
    options.log_statements(LevelFilter::Debug);

    let db = run_blocking(async {
      let mut db = SqliteConnection::connect_with(&options).await.unwrap();

      // region initialing database
      let result = sqlx::query(
        r#"
create table if not exists command_history
(
    id        integer not null
        constraint id
            primary key autoincrement,
    sessionId text,
    cmd       text,
    timestamp text,
    content   text
);

create index if not exists command_history_cmd_index
    on command_history (cmd);

create index if not exists command_history_sessionId_index
    on command_history (sessionId);

create index if not exists command_history_timestamp_index
    on command_history (timestamp);
    "#,
      )
        .execute(&mut db)
        .await;
      // endregion

      if result.is_err() {
        panic!("error when initialing database {result:?}")
      }

      db
    });

    Self {
      db: Mutex::new(db),
      session_id: Mutex::new(gen_session_id()),
    }
  }

  pub async fn new_file(&mut self) {
    *a_lock(&self.session_id).await = gen_session_id();
  }

  pub async fn write(&mut self, command: &CommandPacket) -> Result<()> {
    let mut db = a_lock(&self.db).await;
    let session_id = a_lock(&self.session_id).await;

    sqlx::query(
      "insert into command_history (sessionId, cmd, timestamp, content) values (?,?,?,?)",
    )
    .bind(&*session_id)
    .bind(command.command())
    .bind(command.timestamp().to_rfc3339())
    .bind(command.to_string()?)
    .execute(&mut *db)
    .await?;

    Ok(())
  }

  ///
  ///
  /// # Arguments
  ///
  /// * `session_id`: session id
  /// * `filters`: where conditions will concat using "and"
  /// * `paging`: (limit, offset)
  ///
  /// # Examples
  /// ```
  /// use static_object::StaticObject;
  ///
  /// use chaos_danmu_tool::libs::command::command_history_manager::CommandHistoryManager;
  ///
  ///
  /// #[tokio::main]
  /// async fn main() {
  ///   let mut chm = CommandHistoryManager::i();
  ///
  ///   let result = chm.read(
  ///     "session_id",
  ///     vec![
  ///       ("cmd == ?", "bilibiliCommand.danmuMessage"),
  ///       ("content glob ?", "*\"isVip\":true*")
  ///     ],
  ///     None
  ///   );
  /// }
  /// ```
  ///
  pub async fn read(
    &self,
    session_id: &str,
    filters: Vec<(&str, &str)>,
    paging: Option<(u32, u32)>,
  ) -> Result<Vec<CommandPacket>> {
    let mut db = a_lock(&self.db).await;

    // region construct sql query
    // region construct command
    let mut sql = r#"select * from command_history where sessionId == ?"#.to_string();

    if !filters.is_empty() {
      sql.push_str(" and ");
      sql.push_str(
        filters
          .iter()
          .map(|it| it.0)
          .collect::<Vec<_>>()
          .join(" and ")
          .as_str(),
      )
    }

    sql.push_str(" order by id");

    if let Some((limit, offset)) = paging {
      sql.push_str(&*format!(" limit {limit} offset {offset}"))
    }
    // endregion

    let mut query = sqlx::query(&sql).bind(session_id);
    for item in filters {
      query = query.bind(item.1);
    }
    // endregion

    let query_result = query.fetch_all(&mut *db).await?;

    // region parse
    let mut result = vec![];

    for it in query_result {
      let item = it.try_get::<&str, &str>("content");
      if let Ok(item) = item {
        let item = serde_json::from_str(item);
        if let Ok(item) = item {
          result.push(item);
        } else {
          error!(
            "error occurred when parsing content: {err}",
            err = item.unwrap_err()
          );
        }
      } else {
        error!(
          "error occurred when parsing query result: {err}",
          err = item.unwrap_err()
        );
      }
    }
    // endregion
    Ok(result)
  }

  pub async fn history_storages(&self) -> Result<Vec<String>> {
    let mut db = a_lock(&self.db).await;

    let query_result = sqlx::query("select distinct sessionId from command_history")
      .fetch_all(&mut *db)
      .await?;

    let mut result = vec![];

    for row in query_result {
      let id = row.try_get::<&str, &str>("sessionId");

      if let Ok(id) = id {
        result.push(id.to_string())
      } else {
        error!("failed to get id {err}", err = id.unwrap_err())
      }
    }

    Ok(result)
  }
}

fn gen_session_id() -> String {
  format!(
    "{ts}_{uuid}",
    ts = Utc::now().format("%Y-%m-%d-%H-%M-%S"),
    uuid = uuid::Uuid::new_v4().to_string(),
  )
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to do database operation: {0}")]
  Sqlx(#[from] sqlx::Error),
  #[error("failed to encode command: {0}")]
  FailedToEncode(#[from] command_packet::Error),
}
