/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use log::LevelFilter;
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection, SqliteConnection};

pub fn gen_options(file_name: PathBuf) -> SqliteConnectOptions {
  let mut options = SqliteConnectOptions::new()
    .filename(file_name)
    .create_if_missing(true);
  options.log_statements(LevelFilter::Debug);
  options
}

pub async fn create_db(file_name: PathBuf, initial_sql: &str) -> SqliteConnection {
  let options = gen_options(file_name.clone());

  let mut db = SqliteConnection::connect_with(&options).await.unwrap();

  let result = sqlx::query(initial_sql).execute(&mut db).await;

  if let Err(err) = result {
    panic!(
      "error when initialing database {file}\n{error:?}",
      file = file_name.to_string_lossy(),
      error = err
    );
  }

  db
}
