/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use tauri::api::path::app_config_dir;
use tauri::Config;

use crate::utils::trace_utils::print_trace;

#[derive(Clone)]
pub struct AppContext {
  pub tauri_config: Config,
  pub data_dir: PathBuf,
  pub cache_dir: PathBuf,
  pub logs_dir: PathBuf,
  pub crash_report_dir: PathBuf,
  pub args: Args,
}

impl AppContext {
  pub fn init(config: Config) {
    use std::sync::Once;

    static ONCE: Once = Once::new();

    ONCE.call_once(|| {
      // region process args
      use crate::utils::console_utils::{attach_console, detach_console};

      attach_console();
      let args: Args = argh::from_env();
      detach_console();

      #[cfg(target_os = "windows")]
      {
        use crate::utils::console_utils::alloc_console;
        if args.with_console {
          alloc_console();
        }
      }

      if let Some(dir) = &args.home_dir {
        std::env::set_var("HOME", dir);
      }
      // endregion

      let data_dir = app_config_dir(&config).unwrap();
      let cache_dir = data_dir.join("cache");

      let logs_dir = data_dir.join("logs");
      let crash_report_dir = data_dir.join("crash_report");

      let ctx = AppContext {
        tauri_config: config.clone(),
        data_dir,
        cache_dir,
        logs_dir,
        crash_report_dir,
        args,
      };

      std::fs::create_dir_all(&ctx.data_dir).expect("unable to create app data dir");
      std::fs::create_dir_all(&ctx.cache_dir).expect("unable to create app cache dir");
      std::fs::create_dir_all(&ctx.logs_dir).expect("unable to create app logs dir");
      std::fs::create_dir_all(&ctx.crash_report_dir)
        .expect("unable to create app crash report dir");

      unsafe { APP_CONTEXT = Box::leak(Box::new(ctx)) }
    });
  }

  pub fn i() -> &'static AppContext {
    unsafe {
      if APP_CONTEXT.is_null() {
        print_trace();
        panic!("get before init")
      }
    }

    unsafe { &*APP_CONTEXT }
  }
}

static mut APP_CONTEXT: *const AppContext = 0 as *const AppContext;

#[derive(argh::FromArgs, Clone)]
/// Chaos Danmu Tool options
pub struct Args {
  /// how long that mutex lock should wait for (millisecond)
  #[argh(option, short = 'L', default = "10_000")]
  pub lock_timeout_millis: u64,
  /// enable output full backtrace
  #[argh(switch)]
  pub backtrace_detail: bool,
  /// output to console
  #[cfg(target_os = "windows")]
  #[argh(switch)]
  pub with_console: bool,
  /// set home dir
  #[argh(option)]
  pub home_dir: Option<String>,
  /// connect room on startup
  #[argh(option, short = 'C')]
  pub connect: Option<u32>,
}
