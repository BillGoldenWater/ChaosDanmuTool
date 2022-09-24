/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use log::{error, LevelFilter};
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection, Row, SqliteConnection};

use super::command_packet::{self, CommandPacket};

pub struct CommandHistoryStorage {
  db: SqliteConnection,
}

impl CommandHistoryStorage {
  pub async fn new(data_dir: &PathBuf) -> CommandHistoryStorage {
    let uuid = uuid::Uuid::new_v4();
    let ts = Utc::now();

    Self::open(data_dir.join(gen_file_name(&ts, &uuid))).await
  }

  pub async fn open(file: impl AsRef<Path>) -> CommandHistoryStorage {
    let mut options = SqliteConnectOptions::new()
      .filename(file)
      .create_if_missing(true);
    options.log_statements(LevelFilter::Debug);

    let mut db = SqliteConnection::connect_with(&options).await.unwrap();

    // region initialing database
    let result = sqlx::query(
      r#"
create table if not exists command_history
(
    id        integer not null
        constraint id
            primary key autoincrement,
    cmd       text,
    timestamp text,
    content   text
);

create index if not exists command_history_cmd_index
    on command_history (cmd);

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

    CommandHistoryStorage { db }
  }

  pub async fn write(&mut self, command: &CommandPacket) -> Result<()> {
    sqlx::query("insert into command_history (cmd, timestamp, content) values (?,?,?)")
      .bind(command.command())
      .bind(command.timestamp().to_rfc3339())
      .bind(command.to_string().unwrap())
      .execute(&mut self.db)
      .await?;

    Ok(())
  }

  ///
  ///
  /// # Arguments
  ///
  /// * `filters`: where conditions will concat using "and"
  /// * `limit`: limit
  /// * `offset`: offset, only work when limit is set
  ///
  /// # Examples
  /// ```
  /// use chaosdanmutool::libs::command::command_history_storage::CommandHistoryStorage;
  /// use std::path::PathBuf;
  ///
  /// #[tokio::main]
  /// async fn main() {
  ///   let mut chs = CommandHistoryStorage::open(&PathBuf::from("test.sqlite")).await;
  ///
  ///   let result = chs.read(
  ///     vec![
  ///       ("cmd == ?", "bilibiliCommand.danmuMessage"),
  ///       ("content glob ?", "*\"isVip\":true*")
  ///     ],
  ///     None,
  ///     0,
  ///   );
  /// }
  /// ```
  ///
  pub async fn read(
    &mut self,
    filters: Vec<(&str, &str)>,
    limit: Option<u32>,
    offset: u32,
  ) -> Result<Vec<CommandPacket>> {
    // region construct sql query
    // region construct sql command
    let mut sql = r#"select * from command_history"#.to_string();

    if !filters.is_empty() {
      sql.push_str(" where ");
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

    if let Some(limit) = limit {
      sql.push_str(&*format!(" limit {limit} offset {offset};"));
    }
    // endregion

    let mut query = sqlx::query(&sql);
    for item in filters {
      query = query.bind(item.1);
    }
    // endregion

    let query_result = query.fetch_all(&mut self.db).await?;

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
}

fn gen_file_name(ts: &DateTime<Utc>, uuid: &uuid::Uuid) -> String {
  format!(
    "{ts}_{uuid}.sqlite",
    ts = ts.format("%Y-%m-%d-%H-%M-%S"),
    uuid = uuid.to_string(),
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
