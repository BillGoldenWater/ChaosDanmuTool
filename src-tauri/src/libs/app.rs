/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::info;
use tauri::async_runtime::block_on;
use tauri::{App, Assets, Context};
use tokio::task;

use crate::libs::app::event::{on_activate, on_exit, on_init, on_ready, on_tauri_setup};
use crate::libs::app::internal_api::invoke_handler;
use crate::libs::app_context::init_tauri_config;
use crate::libs::utils::debug_utils::init_logger;

pub mod app_loop;
pub mod event;
pub mod internal_api;

pub async fn run() {
  let context = tauri::generate_context!();
  do_setup(&context);

  print_build_info();

  on_init(&context).await;

  let app = build_tauri_app(context);

  run_tauri_app(app)
}

fn do_setup<A: Assets>(context: &Context<A>) {
  init_logger(context.config());
  init_tauri_config(context.config().clone());

  tauri::async_runtime::set(tokio::runtime::Handle::current());
}

fn build_tauri_app<A: Assets>(context: Context<A>) -> App {
  tauri::Builder::default()
    .setup(|app| {
      task::block_in_place(|| block_on(on_tauri_setup(app)));
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
      task::block_in_place(|| block_on(on_ready(app_handle)));
    }
    #[cfg(target_os = "macos")]
    ExitRequested { api, .. } => {
      api.prevent_exit();
      info!("exit prevented");
    }
    Exit => {
      info!("exiting");
      task::block_in_place(|| block_on(on_exit(app_handle)));
    }
    ApplicationShouldHandleReopen { api, .. } => {
      info!("handling reopen");
      task::block_in_place(|| block_on(on_activate(app_handle)));
      api.prevent_default();
    }

    _ => {}
  });
}

fn print_build_info() {
  info!(
    "build info: {}-{} {}-{} ({} build)",
    env!("CARGO_PKG_NAME"),
    env!("CARGO_PKG_VERSION"),
    std::env::consts::OS,
    std::env::consts::ARCH,
    if cfg!(debug_assertions) {
      "debug"
    } else {
      "release"
    }
  );
}
