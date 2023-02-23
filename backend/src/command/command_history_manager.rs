/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use chrono::Utc;
use log::error;
use sqlx::{QueryBuilder, Row, SqliteConnection};
use tokio::sync::Mutex;

use crate::app_context::AppContext;
use crate::command::command_packet;
use crate::command::command_packet::CommandPacket;
use crate::utils::async_utils::run_blocking;
use crate::utils::db_utils::create_db;
use crate::utils::mutex_utils::a_lock;
use crate::{dialog_ask, dialog_notice};

static FILE_NAME: &str = "commandHistory.sqlite";

#[derive(static_object::StaticObject)]
pub struct CommandHistoryManager {
  db: Mutex<SqliteConnection>,
  session_id: Mutex<String>,
}

impl CommandHistoryManager {
  fn new() -> Self {
    let db_file = AppContext::i().data_dir.join(FILE_NAME);
    let db = run_blocking(create_db(
      db_file,
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
    ));

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

  pub async fn write_many(&mut self, commands: &Vec<CommandPacket>) -> Result<()> {
    if commands.is_empty() {
      return Ok(());
    }

    let mut db = a_lock(&self.db).await;
    let session_id = a_lock(&self.session_id).await;

    let mut cmds = Vec::with_capacity(commands.len());

    for cmd in commands {
      cmds.push((
        cmd.command(),
        cmd.timestamp().to_rfc3339(),
        cmd.to_string()?,
      ));
    }

    let mut query_builder =
      QueryBuilder::new("insert into command_history (sessionId, cmd, timestamp, content) ");

    query_builder.push_values(cmds, |mut b, cmd| {
      b.push_bind(&*session_id)
        .push_bind(cmd.0)
        .push_bind(cmd.1)
        .push_bind(cmd.2);
    });

    query_builder.build().execute(&mut *db).await?;

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
  /// ```no_run
  /// use static_object::StaticObject;
  ///
  /// use chaos_danmu_tool::command::command_history_manager::CommandHistoryManager;
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
  ///   ).await;
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
      sql.push_str(&format!(" limit {limit} offset {offset}"))
    }
    // endregion

    let mut query = sqlx::query(&sql).bind(session_id);
    for item in filters {
      query = query.bind(item.1);
    }
    // endregion

    let result = query
      .map(|row| {
        let item: sqlx::Result<&str> = row.try_get::<&str, &str>("content");
        if let Ok(item) = item {
          let item: serde_json::Result<CommandPacket> = serde_json::from_str(item);
          if let Ok(item) = item {
            Some(item)
          } else {
            error!(
              "error occurred when parsing content: {err}",
              err = item.unwrap_err()
            );
            None
          }
        } else {
          error!(
            "error occurred when parsing query result: {err}",
            err = item.unwrap_err()
          );
          None
        }
      })
      .fetch_all(&mut *db)
      .await?
      .into_iter()
      .flatten()
      .collect::<Vec<_>>();

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

  pub async fn set_index_content(&mut self, enable: bool) {
    let sql = if enable {
      let confirm = dialog_ask!(@warn, "是否确定启用内容索引, 这将需要一些时间, 且历史记录文件大小将大幅增加(大小至少是之前的2倍)");
      if !confirm {
        return;
      }

      r#"
create index if not exists command_history_content_index
    on command_history (content);
    "#
    } else {
      let confirm = dialog_ask!(@warn, "是否确定禁用内容索引, 这将需要一些时间, 且会降低搜索的速度(耗时约为之前的3倍)");
      if !confirm {
        return;
      }

      r#"
drop index if exists command_history_content_index;
vacuum;
      "#
    };

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(sql).execute(&mut *db).await;

    if let Err(err) = result {
      error!("unable to apply index change \n{err:?}");
      dialog_notice!(@error, "应用索引修改时发生错误");
    }

    dialog_notice!(@success, "完成索引修改");
  }

  pub async fn is_content_indexed(&self) -> Result<bool> {
    let sql = "select count(*) as count from sqlite_master where type = 'index' and name = 'command_history_content_index';";

    let mut db = a_lock(&self.db).await;

    let result = sqlx::query(sql).fetch_one(&mut *db).await?;

    let count: u32 = result.get("count");

    Ok(count > 0)
  }
}

fn gen_session_id() -> String {
  format!(
    "{ts}_{uuid}",
    ts = Utc::now().format("%Y-%m-%d-%H-%M-%S"),
    uuid = uuid::Uuid::new_v4(),
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
