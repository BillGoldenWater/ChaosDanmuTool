/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;

use crate::app_context::AppContext;

pub fn print_trace() {
  print_trace_message("trace")
}

pub fn print_trace_message(msg: &str) {
  error!("{msg}: \n{}", gen_trace_message());
}

#[track_caller]
pub fn gen_trace_message() -> String {
  let bt = backtrace::Backtrace::new();

  if AppContext::i().args.backtrace_detail {
    format!("{bt:?}")
  } else {
    format!("{bt:?}")
      .split('\n')
      .filter(|it| it.contains(env!("CARGO_PKG_NAME")))
      .collect::<Vec<&str>>()
      .join("\n")
  }
}
