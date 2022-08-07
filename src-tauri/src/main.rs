/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::async_runtime::block_on;
use tauri::{command, App, AppHandle, Manager, Wry};
use tauri::{Assets, Context, WindowEvent};
use tokio::sync::RwLock;
use tokio::task;

use chaosdanmutool::info;
use chaosdanmutool::libs::command::command_history_manager::CommandHistoryManager;
use chaosdanmutool::libs::command::command_packet::app_command::viewer_status_update::{
  ViewerStatus, ViewerStatusUpdate,
};
use chaosdanmutool::libs::command::command_packet::app_command::AppCommand;
use chaosdanmutool::libs::config::config_manager::ConfigManager;
use chaosdanmutool::libs::network::command_broadcast_server::CommandBroadcastServer;
use chaosdanmutool::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use chaosdanmutool::libs::network::http_server::HttpServer;
#[cfg(target_os = "macos")]
use chaosdanmutool::libs::utils::window_utils::set_visible_on_all_workspaces;

static VIBRANCY_APPLIED: RwLock<bool> = RwLock::const_new(false);

#[tokio::main]
async fn main() {
  // region build info
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
  // endregion

  tauri::async_runtime::set(tokio::runtime::Handle::current());

  let context = tauri::generate_context!();

  on_init(&context).await;

  // region init
  let app = tauri::Builder::default()
    .setup(|app| {
      task::block_in_place(|| block_on(on_setup(app)));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      is_vibrancy_applied,
      show_viewer_window,
      close_viewer_window,
      is_viewer_window_open
    ])
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
      info!("ready");
      task::block_in_place(|| block_on(on_ready(app_handle)));
    }
    #[cfg(target_os = "macos")]
    tauri::RunEvent::ExitRequested { api, .. } => {
      // exit requested event
      api.prevent_exit();
      info!("exit prevented");
    }
    tauri::RunEvent::Exit => {
      info!("exiting");
      task::block_in_place(|| block_on(on_exit(app_handle)));
    }
    tauri::RunEvent::ApplicationShouldHandleReopen {
      has_visible_windows: _,
      api,
    } => {
      info!("handling reopen");
      task::block_in_place(|| block_on(on_activate(app_handle)));
      api.prevent_default();
    }

    _ => {}
  });
  //endregion
}

async fn on_init<A: Assets>(context: &Context<A>) {
  ConfigManager::init(context).await;
  CommandHistoryManager::init(context).await;

  start_ticking();
}

async fn on_setup(app: &mut App<Wry>) {
  let asset_resolver = app.asset_resolver();

  let port = ConfigManager::get_config()
    .await
    .backend
    .http_server
    .port
    .clone();
  HttpServer::start(asset_resolver, port).await;
}

async fn on_ready(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle).await;
}

async fn on_activate(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle).await;
}

async fn on_exit(_app_handle: &AppHandle<Wry>) {
  if DanmuReceiver::is_connected().await {
    DanmuReceiver::disconnect().await;
  }

  HttpServer::stop().await;
  CommandBroadcastServer::close_all().await;
  ConfigManager::on_exit().await;
}

fn start_ticking() {
  tauri::async_runtime::spawn(async {
    loop {
      DanmuReceiver::tick().await;
      CommandBroadcastServer::tick().await;
      ConfigManager::tick().await;
      tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
    }
  });
}

async fn show_main_window(app_handle: &AppHandle<Wry>) {
  let main_window = app_handle.get_window("main");

  if let Some(main_window) = main_window {
    main_window.show().expect("failed to show main_window");
  } else {
    create_main_window(&app_handle).await;
  }
}

async fn create_main_window(app_handle: &AppHandle<Wry>) {
  let main_window = tauri::WindowBuilder::new(
    app_handle,
    "main",
    tauri::WindowUrl::App("main/index.html".into()),
  )
  .transparent(true)
  .build()
  .unwrap();

  main_window
    .set_title("Chaos Danmu Tool")
    .expect("failed to set title of main_window");

  #[cfg(debug_assertions)]
  {
    main_window
      .set_always_on_top(true)
      .expect("failed to set always on top of main_window");
    main_window.open_devtools()
  }

  #[cfg(any(target_os = "windows", target_os = "macos"))]
  apply_vibrancy_effect(&main_window).await;
}

#[command]
fn show_viewer_window(app_handle: AppHandle<Wry>) {
  let viewer_window = app_handle.get_window("viewer");

  if let Some(viewer_window) = viewer_window {
    viewer_window.show().expect("failed to show viewer_window");
  } else {
    task::block_in_place(|| block_on(create_viewer_window(&app_handle)));
  }

  task::block_in_place(|| {
    block_on(CommandBroadcastServer::broadcast_app_command(
      AppCommand::from_viewer_status_update(ViewerStatusUpdate::new(ViewerStatus::Open)),
    ))
  })
}

#[command]
fn close_viewer_window(app_handle: AppHandle<Wry>) {
  let viewer_window = app_handle.get_window("viewer");
  if let Some(viewer_window) = viewer_window {
    viewer_window
      .close()
      .expect("failed to close viewer_window")
  }
}

#[command]
fn is_viewer_window_open(app_handle: AppHandle<Wry>) -> bool {
  if let Some(window) = app_handle.get_window("viewer") {
    window.is_visible().unwrap_or(false)
  } else {
    false
  }
}

async fn create_viewer_window(app_handle: &AppHandle<Wry>) {
  let cfg = ConfigManager::get_config()
    .await
    .backend
    .window
    .viewer_window;

  let viewer_window = tauri::WindowBuilder::new(
    app_handle,
    "viewer",
    tauri::WindowUrl::App("viewer/index.html".into()),
  )
  .transparent(true)
  .decorations(false)
  .position(cfg.x as f64, cfg.y as f64)
  .inner_size(cfg.width as f64, cfg.height as f64)
  .build()
  .unwrap();

  viewer_window
    .set_title("Chaos Danmu Tool - Viewer")
    .expect("failed to set title of viewer_window");

  viewer_window.on_window_event(|event| match event {
    WindowEvent::Resized(size) => {
      task::block_in_place(|| {
        block_on(async {
          let mut cfg = ConfigManager::get_config().await;
          cfg.backend.window.viewer_window.height = size.height;
          cfg.backend.window.viewer_window.width = size.width;
          ConfigManager::set_config(cfg, true).await;
        })
      });
    }
    WindowEvent::Moved(pos) => {
      task::block_in_place(|| {
        block_on(async {
          let mut cfg = ConfigManager::get_config().await;
          cfg.backend.window.viewer_window.x = pos.x;
          cfg.backend.window.viewer_window.y = pos.y;
          ConfigManager::set_config(cfg, true).await;
        })
      });
    }
    WindowEvent::Destroyed => {
      task::block_in_place(|| {
        block_on(CommandBroadcastServer::broadcast_app_command(
          AppCommand::from_viewer_status_update(ViewerStatusUpdate::new(ViewerStatus::Close)),
        ))
      });
    }
    _ => {}
  });

  viewer_window
    .set_always_on_top(true)
    .expect("failed to set always on top of viewer_window");

  #[cfg(target_os = "macos")]
  set_visible_on_all_workspaces(&viewer_window, true, true, false);

  let _ = window_shadows::set_shadow(viewer_window, false);
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
async fn apply_vibrancy_effect(window: &tauri::Window<Wry>) {
  let result;

  #[cfg(target_os = "macos")]
  {
    use window_vibrancy::apply_vibrancy;

    result = apply_vibrancy(window, window_vibrancy::NSVisualEffectMaterial::HudWindow);
  }
  #[cfg(target_os = "windows")]
  {
    use window_vibrancy::apply_mica;

    result = apply_mica(window);
  }

  if result.is_ok() {
    *VIBRANCY_APPLIED.write().await = true;
  }
}

#[command]
async fn is_vibrancy_applied() -> bool {
  *VIBRANCY_APPLIED.read().await
}

#[allow(unused)]
fn exit() {
  std::process::exit(0);
}
