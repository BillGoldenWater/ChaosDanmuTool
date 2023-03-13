/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use const_format::formatcp;
use log::{info, warn};
use tauri::{App, Assets, Context};

use crate::app::event::{on_exit, on_init, on_ready, on_setup};
use crate::app::internal_api::invoke_handler;
use crate::utils::async_utils::run_blocking;

pub mod app_loop;
pub mod event;
pub mod internal_api;

pub async fn run() {
  let context = tauri::generate_context!();
  on_init(&context);

  print_env_info();

  let app = build_tauri_app(context);

  run_tauri_app(app)
}

fn build_tauri_app<A: Assets>(context: Context<A>) -> App {
  tauri::Builder::default()
    .setup(|app| {
      run_blocking(on_setup(app));
      Ok(())
    })
    .invoke_handler(invoke_handler)
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default("Chaos Danmu Tool")
    } else {
      tauri::Menu::default()
    })
    .build(context)
    .expect("error while building tauri application")
}

fn run_tauri_app(app: App) {
  use tauri::RunEvent::*;
  app.run(move |app_handle, event| match event {
    Ready {} => {
      info!("ready");
      run_blocking(on_ready(app_handle))
    }
    Exit => {
      info!("exiting");
      run_blocking(on_exit(app_handle));
    }

    // #[cfg(target_os = "macos")]
    // ExitRequested { api, .. } => {
    //   api.prevent_exit();
    //   info!("exit prevented");
    // }
    // ApplicationShouldHandleReopen { api, .. } => {
    //   info!("handling reopen");
    //   run_blocking(on_activate(app_handle));
    //   api.prevent_default();
    // }
    _ => {}
  });
}

fn print_env_info() {
  info!("build info: {}", build_info());
  #[cfg(target_os = "macos")]
  {
    use crate::utils::process_utils::is_running_under_rosetta;

    if std::env::consts::ARCH == "x86_64" {
      match is_running_under_rosetta() {
        Ok(under_rosetta) => {
          if under_rosetta {
            info!("under rosetta: true");
          }
        }
        Err(err) => {
          warn!("under rosetta: {err:?}");
        }
      }
    }
  }
}

fn build_info() -> &'static str {
  const VERSION: &str = concat!(env!("CARGO_PKG_NAME"), "-", env!("CARGO_PKG_VERSION"));
  const TARGET: &str = formatcp!("{}-{}", std::env::consts::OS, std::env::consts::ARCH);
  const DEBUG: &str = if cfg!(debug_assertions) {
    "debug_assertions"
  } else {
    ""
  };
  const TAURI_DEV: &str = if cfg!(dev) { "dev_mode" } else { "" };

  formatcp!("{VERSION} {TARGET} {DEBUG} {TAURI_DEV}")
}
