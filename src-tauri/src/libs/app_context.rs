/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use clap::Parser;
use tauri::api::path::app_config_dir;
use tauri::Config;

use crate::libs::utils::trace_utils::print_trace;

#[derive(Clone)]
pub struct AppContext {
  pub tauri_config: Config,
  pub data_dir: PathBuf,
  pub args: Args,
}

impl AppContext {
  pub fn init(config: Config) {
    use std::sync::Once;

    static ONCE: Once = Once::new();

    ONCE.call_once(|| {
      // region process args
      use crate::libs::utils::console_utils::{attach_console, detach_console};

      attach_console();
      let args = Args::parse();
      detach_console();

      #[cfg(target_os = "windows")]
      {
        if args.attach_console {
          attach_console();
        }
      }
      // endregion

      let ctx = AppContext {
        tauri_config: config.clone(),
        data_dir: app_config_dir(&config).unwrap(),
        args,
      };

      std::fs::create_dir_all(&ctx.data_dir).expect("unable to create app data dir");

      unsafe { APP_CONTEXT = Box::leak(Box::new(ctx)) }
    });
  }

  pub fn i() -> AppContext {
    unsafe {
      if APP_CONTEXT.is_null() {
        print_trace();
        panic!("get before init")
      }
    }

    unsafe { (*APP_CONTEXT).clone() }
  }
}

static mut APP_CONTEXT: *const AppContext = 0 as *const AppContext;

#[derive(Parser, Clone)]
#[command(author, version, about = None, long_about = None)]
pub struct Args {
  /// How long that mutex lock should wait for (millisecond)
  #[arg(short = 'L', long, default_value_t = 1000)]
  pub lock_timeout_millis: u64,
  /// Enable output full backtrace
  #[arg(short, long)]
  pub backtrace_detail: bool,
  /// Output to console
  #[cfg(target_os = "windows")]
  #[arg(short, long)]
  pub attach_console: bool,
}
