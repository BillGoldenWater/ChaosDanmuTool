/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn setup_panic_hook() {
  #[cfg(not(debug_assertions))]
  std::panic::set_hook(Box::new(handle_panic));
}

#[cfg(not(debug_assertions))]
fn handle_panic(info: &std::panic::PanicInfo) {
  use crate::dialog_notice;
  use log::error;

  let meta = human_panic::Metadata {
    version: env!("CARGO_PKG_VERSION").into(),
    name: env!("CARGO_PKG_NAME").into(),
    authors: env!("CARGO_PKG_AUTHORS").replace(':', ", ").into(),
    homepage: Default::default(),
  };

  let dump_path = human_panic::handle_dump(&meta, info);

  if let Some(dump_path) = dump_path {
    error!(
      "unrecoverable error, crash report created at: {}",
      dump_path.display()
    );
    dialog_notice!(@error, format!("无法恢复的错误, 崩溃报告已保存至: {}", dump_path.display()));
  } else {
    error!("unrecoverable error, failed to create crash report");
    dialog_notice!(@error, "无法恢复的错误, 创建崩溃报告失败.");
  }
}
