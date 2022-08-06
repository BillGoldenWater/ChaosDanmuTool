/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

#[macro_export]
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

#[macro_export]
#[allow(unused_macros)]
macro_rules! log {
  ($lvl:tt) => {
    println!("{}", $crate::log_format!($lvl))
  };
  ($lvl:tt,$($arg:tt)*) => {
    println!("{}", $crate::log_format!($lvl, $($arg)*))
  };
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! info {
  () => {
    $crate::log!("INFO")
  };
  ($($arg:tt)*) => {
    $crate::log!("INFO", $($arg)*)
  };
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! warn {
  () => {
    $crate::log!("WARN")
  };
  ($($arg:tt)*) => {
    $crate::log!("WARN", $($arg)*)
  };
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! error {
  () => {
    $crate::log!("ERROR")
  };
  ($($arg:tt)*) => {
    $crate::log!("ERROR", $($arg)*)
  };
}
