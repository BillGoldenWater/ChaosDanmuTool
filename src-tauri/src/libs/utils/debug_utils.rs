/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fmt::Arguments;
use std::fs;
use std::fs::File;

use fern::colors::ColoredLevelConfig;
use fern::FormatCallback;
use log::{LevelFilter, Record};
use tauri::api::path::app_dir;
use tauri::Config;

enum LogTarget {
  Stdout,
  File,
}

pub fn init_logger(config: &Config) {
  // region stdout dispatch
  let stdout_dispatch = fern::Dispatch::new()
    .format(|out, message, record| format_log(out, message, record, LogTarget::Stdout))
    .chain(std::io::stdout());
  // endregion

  // region file dispatch
  let logger_file_result = get_logger_file(config);
  let file_dispatch = if let Ok(file) = logger_file_result {
    fern::Dispatch::new()
      .format(|out, message, record| format_log(out, message, record, LogTarget::File))
      .chain(file)
  } else {
    eprintln!(
      "failed to initialize logger file: {err}",
      err = logger_file_result.unwrap_err()
    );
    fern::Dispatch::new().level(LevelFilter::Off)
  };
  // endregion

  fern::Dispatch::new()
    .chain(stdout_dispatch)
    .chain(file_dispatch)
    .apply()
    .unwrap();
}

lazy_static! {
  static ref LOG_COLORS: ColoredLevelConfig = ColoredLevelConfig::default();
}

fn format_log(out: FormatCallback, message: &Arguments, record: &Record, target: LogTarget) {
  let prefix = format!(
    "{ts}[{target}][{lvl}]",
    ts = chrono::Local::now().format("[%Y-%m-%d %H:%M:%S.%3f]"),
    target = record.target(),
    lvl = match target {
      LogTarget::Stdout => format!("{}", LOG_COLORS.color(record.level())),
      LogTarget::File => format!("{}", record.level()),
    },
  );

  out.finish(format_args!("{prefix} {message}"))
}

fn get_logger_file(config: &Config) -> Result<File, String> {
  let log_dir = app_dir(config).unwrap().join("logs");
  if !log_dir.exists() {
    let result = fs::create_dir_all(&log_dir);
    if let Err(err) = result {
      return Err(format!("{err}"));
    }
  }

  let log_file = log_dir.join(format!(
    "{ts}_{uuid}.log",
    ts = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S_%3f"),
    uuid = uuid::Uuid::new_v4().to_string(),
  ));

  let result = fern::log_file(log_file);
  result.map_err(|it| format!("{it}"))
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
