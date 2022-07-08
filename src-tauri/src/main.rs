/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::time::Duration;

#[allow(unused_imports)]
use tauri::{App, AppHandle, command, Manager, Wry};
use tauri::{Assets, Context};
use tokio::time::sleep;

use chaosdanmutool::libs::config::config_manager::ConfigManager;
use chaosdanmutool::libs::network::command_broadcast_server::CommandBroadcastServer;
use chaosdanmutool::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use chaosdanmutool::libs::network::http_server::HTTP_SERVER_STATIC_INSTANCE;
#[cfg(target_os = "macos")]
use chaosdanmutool::libs::utils::window_utils::set_visible_on_all_workspaces;
use chaosdanmutool::{lprintln};

#[tokio::main]
async fn main() {
  let context = tauri::generate_context!();

  on_init(&context).await;

  // region init
  let app = tauri::Builder::default()
    .setup(|app| {
      on_setup(app);
      Ok(())
    })
    // .invoke_handler(tauri::generate_handler![connect,disconnect,listen,broadcast,close])
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default("Chaos Danmu Tool")
    } else {
      tauri::Menu::default()
    })
    .build(context)
    .expect("error while building tauri application");
  // endregion

  //region run
  app.run(|app_handle, event| match event {
    tauri::RunEvent::Ready {} => {
      // ready event
      lprintln!("ready");
      on_ready(app_handle)
    }
    tauri::RunEvent::ExitRequested { api, .. } => {
      // exit requested event
      lprintln!("exit requested");
      api.prevent_exit();
      lprintln!("exit prevented");
    }
    tauri::RunEvent::Exit => {
      lprintln!("exiting");
      ConfigManager::save();
    }

    _ => {}
  });
  //endregion
}

async fn on_init<A: Assets>(context: &Context<A>) {
  start_ticking();

  ConfigManager::init(context);
}

fn start_ticking() {
  tauri::async_runtime::spawn(async {
    loop {
      DanmuReceiver::tick().await;
      CommandBroadcastServer::tick().await;
      sleep(Duration::from_micros(200)).await;
    }
  });
}

fn on_setup(app: &mut App<Wry>) {
  show_main_window(app.app_handle());

  let asset_resolver = app.asset_resolver();
  tauri::async_runtime::spawn(async move {
    (*HTTP_SERVER_STATIC_INSTANCE).lock().await.start_(asset_resolver, 25525); // TODO: port config
  });
}

fn on_ready(_app_handle: &AppHandle<Wry>) {}

fn show_main_window(app_handle: AppHandle<Wry>) {
  let main_window = app_handle.get_window("main");

  if let Some(main_window) = main_window {
    main_window.show().expect("Failed to show main_window");
  } else {
    create_main_window(app_handle)
  }
}

fn create_main_window(app_handle: AppHandle<Wry>) {
  let main_window = tauri::WindowBuilder::new(
    &app_handle,
    "main",
    tauri::WindowUrl::App("index.html".into()),
  )
    .build()
    .unwrap();

  main_window
    .set_title("Chaos Danmu Tool")
    .expect("Failed to set title of main_window");

  #[cfg(debug_assertions)]
  {
    main_window
      .set_always_on_top(true)
      .expect("Failed to set always on top of main_window");
    main_window.open_devtools()
  }

  #[cfg(target_os = "macos")]
  set_visible_on_all_workspaces(main_window, true, true, false);
}

#[allow(unused)]
fn exit() {
  std::process::exit(0);
}
