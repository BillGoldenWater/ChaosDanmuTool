/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use tauri::api::path::app_config_dir;
use tauri::Config;

use crate::libs::utils::trace_utils::print_trace;

#[derive(Clone)]
pub struct AppContext {
  pub tauri_config: Config,
  pub data_dir: PathBuf,
}

impl AppContext {
  pub fn init(config: Config) {
    use std::sync::Once;

    static ONCE: Once = Once::new();

    ONCE.call_once(|| {
      let ctx = AppContext {
        tauri_config: config.clone(),
        data_dir: app_config_dir(&config).unwrap(),
      };

      std::fs::create_dir_all(&ctx.data_dir).expect("unable to create app data dir");

      unsafe { APP_CONTEXT = Box::leak(Box::new(ctx)) }
    });
  }

  pub fn i() -> AppContext {
    unsafe {
      if APP_CONTEXT == 0 as *const AppContext {
        print_trace();
        panic!("get before init")
      }
    }

    unsafe { (*APP_CONTEXT).clone() }
  }
}

static mut APP_CONTEXT: *const AppContext = 0 as *const AppContext;
