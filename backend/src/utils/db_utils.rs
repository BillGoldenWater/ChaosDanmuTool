/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use log::LevelFilter;
use sqlx::query_builder::Separated;
use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection, Encode, QueryBuilder, Sqlite, SqliteConnection, Type};

pub const SQLITE_BIND_LIMIT: usize = 32766;

pub fn gen_options(file_name: PathBuf) -> SqliteConnectOptions {
  let mut options = SqliteConnectOptions::new()
    .filename(file_name)
    .create_if_missing(true)
    .foreign_keys(true);
  options.log_statements(LevelFilter::Trace);
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

pub fn query_sel_many<'value, I, Item>(
  from: &str,
  key: &str,
  values: I,
) -> QueryBuilder<'value, Sqlite>
where
  I: IntoIterator<Item = Item>,
  Item: 'value + Encode<'value, Sqlite> + Send + Type<Sqlite>,
{
  let mut builder = QueryBuilder::new(format!("select * from {from} where {key} in ("));

  let mut separated = builder.separated(", ");
  for value in values {
    separated.push_bind(value);
  }
  separated.push_unseparated(") ");

  builder
}

pub fn query_ins_rep_many<'value, I, F>(
  into: &str,
  columns: &str,
  values: I,
  push_values: F,
) -> QueryBuilder<'value, Sqlite>
where
  I: IntoIterator,
  F: FnMut(Separated<'_, 'value, Sqlite, &'static str>, I::Item),
{
  let mut builder = QueryBuilder::new(format!("insert or replace into {into} ({columns}) "));

  builder.push_values(values, push_values);

  builder
}
