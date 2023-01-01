/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::Cow;
use std::panic::PanicInfo;
use std::path::PathBuf;

use backtrace::{Backtrace, BacktraceSymbol};
use serde::Serialize;

use crate::app_context::AppContext;
use crate::utils::gen_utils::gen_time_with_uuid;

pub fn setup_panic_hook() {
  #[cfg(not(debug_assertions))]
  std::panic::set_hook(Box::new(handle_panic));
}

#[allow(dead_code)]
fn handle_panic(panic_info: &PanicInfo) {
  use crate::dialog_notice;
  use log::error;

  let panic_data = PanicData {
    panic_info,
    name: env!("CARGO_PKG_NAME").into(),
    version: env!("CARGO_PKG_VERSION").into(),
    authors: env!("CARGO_PKG_AUTHORS").replace(':', ", ").into(),
  };

  let dump_path = create_dump(panic_data);

  match dump_path {
    Ok(path) => {
      error!(
        "unrecoverable error, crash report created at: {}",
        path.display()
      );
      dialog_notice!(@error, format!("无法恢复的错误, 崩溃报告已保存至: \n{}\n", path.display()));
    }
    Err(err) => {
      error!("unrecoverable error, failed to create crash report\n {err:?}");
      dialog_notice!(@error raw, format!("无法恢复的错误, 创建崩溃报告失败, 请检查日志或联系开发者\n{err:?}"));
    }
  }
}

fn create_dump(panic_data: PanicData<'_>) -> Result<PathBuf, DumpCreateError> {
  let info = panic_data.panic_info;

  // region get cause message
  #[cfg(feature = "nightly")]
  let message = panic_info.message().map(|m| format!("{}", m));

  #[cfg(not(feature = "nightly"))]
  let message = match (
    info.payload().downcast_ref::<&str>(),
    info.payload().downcast_ref::<String>(),
  ) {
    (Some(s), _) => Some(s.to_string()),
    (_, Some(s)) => Some(s.to_string()),
    (None, None) => None,
  };

  let cause = match message {
    Some(m) => m,
    None => "unknown".into(),
  };
  // endregion

  // region get location
  let location = match info.location() {
    Some(loc) => format!(
      "{file}:{line}:{col}",
      file = loc.file(),
      line = loc.line(),
      col = loc.column()
    ),
    None => "unknown".to_string(),
  };
  // endregion

  // region get platform info
  let os_info = os_type::current_platform();
  let platform = format!("{:?}-{}", os_info.os_type, os_info.version);
  // endregion

  // region get backtrace
  static SKIP_FRAMES_NUM: usize = 4 + 2 + 6; // 4(backtrace) + 2(panic_utils) + 6(std)

  let backtrace = Backtrace::new()
    .frames()
    .iter()
    .skip(SKIP_FRAMES_NUM)
    .flat_map(|frame| {
      let symbols = frame.symbols();
      if symbols.is_empty() {
        return vec!["<unresolved>".to_string()];
      }

      let last_idx = symbols.len() - 1;

      symbols
        .iter()
        .enumerate()
        .map(|(idx, symbol)| symbol_to_string(symbol, idx != last_idx))
        .collect::<Vec<_>>()
    })
    .collect::<Vec<_>>();
  let backtrace_filtered = backtrace
    .iter()
    .filter(|it| it.contains(panic_data.name.as_ref()))
    .map(String::clone)
    .collect::<Vec<_>>()
    .join("\n");
  let backtrace_full = backtrace.join("\n");
  // endregion

  // region gen dump
  let dump = PanicDump {
    name: panic_data.name.into(),
    version: panic_data.version.into(),
    authors: panic_data.authors.into(),
    platform,
    cause,
    location,
    backtrace_filtered,
    backtrace_full,
  };

  let file_name = format!("cdt_crash_report_{}.toml", gen_time_with_uuid());
  let file_path = AppContext::i().crash_report_dir.join(file_name);
  std::fs::write(&file_path, dump.serialize()?)?;
  // endregion

  Ok(file_path)
}

#[inline]
fn symbol_to_string(symbol: &BacktraceSymbol, padding: bool) -> String {
  let padding = if padding { "+ " } else { "" };

  let name = symbol
    .name()
    .map_or_else(|| "<unknown>".to_string(), |it| it.to_string());

  let loc = if let (Some(file_path), Some(line), Some(col)) =
    (symbol.filename(), symbol.lineno(), symbol.colno())
  {
    let file = file_path.display();
    format!("\n{padding}  {file}:{line}:{col}")
  } else {
    "".to_string()
  };

  format!("{padding}{name}{loc}")
}

struct PanicData<'a> {
  panic_info: &'a PanicInfo<'a>,
  name: Cow<'static, str>,
  version: Cow<'static, str>,
  authors: Cow<'static, str>,
}

#[derive(Serialize)]
struct PanicDump {
  name: String,
  version: String,
  authors: String,
  platform: String,

  cause: String,
  location: String,

  backtrace_filtered: String,
  backtrace_full: String,
}

impl PanicDump {
  fn serialize(&self) -> Result<String, toml::ser::Error> {
    toml::to_string_pretty(&self)
  }
}

#[derive(Debug, thiserror::Error)]
enum DumpCreateError {
  #[error("failed to serialize dump\n {0}")]
  Serialize(#[from] toml::ser::Error),
  #[error("io error\n {0}")]
  Io(#[from] std::io::Error),
}
