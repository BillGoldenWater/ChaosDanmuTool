/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fmt::Arguments;
use std::fs;
use std::fs::File;
use std::path::PathBuf;

use fern::colors::ColoredLevelConfig;
use fern::FormatCallback;
use log::{LevelFilter, Record};

use crate::libs::app_context::AppContext;

enum LogTarget {
  Stdout,
  File,
}

pub fn init_logger() {
  // region stdout dispatch
  let stdout_dispatch = fern::Dispatch::new()
    .format(|out, message, record| format_log(out, message, record, LogTarget::Stdout))
    .chain(std::io::stdout())
    .level(if cfg!(debug_assertions) {
      LevelFilter::Debug
    } else {
      LevelFilter::Info
    })
    .level_for("sqlx", LevelFilter::Info);
  // endregion

  let mut dispatch = fern::Dispatch::new().chain(stdout_dispatch);

  for d in get_file_dispatches() {
    dispatch = dispatch.chain(d)
  }

  dispatch.apply().unwrap();
}

fn get_file_dispatches() -> Vec<fern::Dispatch> {
  let mut result = vec![];

  let file_results = vec![
    (get_logger_file(), LevelFilter::Info),
    (get_debug_logger_file(), LevelFilter::Debug),
  ];

  file_results.into_iter().for_each(|f| {
    if let Ok(file) = f.0 {
      result.push(create_file_dispatch(file).level(f.1))
    } else {
      eprintln!(
        "failed to initialize logger file: {err}",
        err = f.0.unwrap_err()
      );
    }
  });

  result
}

fn create_file_dispatch(file: File) -> fern::Dispatch {
  fern::Dispatch::new()
    .format(|out, message, record| format_log(out, message, record, LogTarget::File))
    .chain(file)
}

lazy_static! {
  static ref LOG_COLORS: ColoredLevelConfig = ColoredLevelConfig::default();
}

fn format_log(out: FormatCallback, message: &Arguments, record: &Record, target: LogTarget) {
  let prefix = format!(
    "{ts}[{target}][{lvl}]",
    ts = chrono::Local::now().format("[%Y-%m-%d %H:%M:%S.%3f]"),
    target = record.target().replace("chaos_danmu_tool::libs", ""),
    lvl = match target {
      LogTarget::Stdout => format!("{}", LOG_COLORS.color(record.level())),
      LogTarget::File => format!("{}", record.level()),
    },
  );

  out.finish(format_args!("{prefix} {message}"))
}

fn get_logger_file() -> Result<File, Error> {
  get_logger_file_by_path(gen_logger_file_path(format!(
    "{ts}_{uuid}",
    ts = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S_%3f"),
    uuid = uuid::Uuid::new_v4(),
  ))?)
}

fn get_debug_logger_file() -> Result<File, Error> {
  let path = gen_logger_file_path("debug".to_string())?;

  if path.exists() {
    fs::remove_file(path.clone())?;
  }

  get_logger_file_by_path(path)
}

fn get_logger_file_by_path(path: PathBuf) -> Result<File, Error> {
  Ok(fern::log_file(path)?)
}

fn gen_logger_file_path(name: String) -> Result<PathBuf, Error> {
  let log_dir = AppContext::i().data_dir.join("logs");
  if !log_dir.exists() {
    fs::create_dir_all(&log_dir)?;
  }

  Ok(log_dir.join(format!("{name}.log")))
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error("io error: {0}")]
  Io(#[from] std::io::Error),
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! location_info {
  () => {
    format!(
      "[{}, {}:{}, {:?}]",
      file!()
        .trim_start_matches("src/")
        .trim_start_matches("libs/")
        .trim_end_matches(".rs")
        .replace("/", "."),
      line!(),
      column!(),
      std::thread::current().id()
    )
  };
}

#[allow(unused_macros)]
macro_rules! log_format {
  ($lvl:tt) => {
    format!(
      "{}{}{}",
      chrono::Utc::now().format("[%H:%M:%S.%3f]"),
      $crate::location_info!(),
      format!("[{}]", $lvl)
    )
  };
  ($lvl:tt,$($arg:tt)*) => {
    format!("{} {}", $crate::log_format!($lvl), format!($($arg)*))
  };
}

#[allow(unused_macros)]
macro_rules! log {
  ($lvl:tt) => {
    println!("{}", $crate::log_format!($lvl))
  };
  ($lvl:tt,$($arg:tt)*) => {
    println!("{}", $crate::log_format!($lvl, $($arg)*))
  };
}

#[allow(unused_macros)]
macro_rules! info {
  () => {
    $crate::log!("INFO")
  };
  ($($arg:tt)*) => {
    $crate::log!("INFO", $($arg)*)
  };
}

#[allow(unused_macros)]
macro_rules! warn {
  () => {
    $crate::log!("WARN")
  };
  ($($arg:tt)*) => {
    $crate::log!("WARN", $($arg)*)
  };
}

#[allow(unused_macros)]
macro_rules! error {
  () => {
    $crate::log!("ERROR")
  };
  ($($arg:tt)*) => {
    $crate::log!("ERROR", $($arg)*)
  };
}
