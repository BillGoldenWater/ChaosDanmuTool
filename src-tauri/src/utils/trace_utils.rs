/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::app_context::AppContext;
use log::error;

pub fn print_trace() {
  print_trace_message("trace")
}

pub fn print_trace_message(msg: &str) {
  let bt = backtrace::Backtrace::new();
  let bt_str = format!("{bt:?}")
    .split('\n')
    .filter(|it| it.contains(env!("CARGO_PKG_NAME")))
    .collect::<Vec<&str>>()
    .join("\n");

  if AppContext::i().args.backtrace_detail {
    error!("{msg}: \n{bt:?}");
  } else {
    error!("{msg}: \n{bt_str}");
  }
}
