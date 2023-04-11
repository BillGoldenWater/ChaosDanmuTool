/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::{command, Manager, WindowEvent, Wry};
use tokio::sync::RwLock;

use crate::app::config_manager::{modify_cfg, ConfigManager};
use crate::command::command_packet::app_command::viewer_status_update::{
  ViewerStatus, ViewerStatusUpdate,
};
use crate::get_cfg;
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::utils::async_utils::run_blocking;
use crate::utils::immutable_utils::Immutable;
use crate::utils::window_utils::set_visible_on_all_workspaces;

#[command]
pub fn show_main_window(app_handle: tauri::AppHandle) {
  let main_window = app_handle.get_window("main");

  if let Some(main_window) = main_window {
    main_window.show().expect("failed to show main_window");
  } else {
    create_main_window(app_handle);
  }
}

#[command]
pub fn create_main_window(app_handle: tauri::AppHandle) {
  let main_window_builder = tauri::WindowBuilder::new(
    &app_handle,
    "main",
    tauri::WindowUrl::App("index.html".into()),
  )
  .transparent(true);

  let main_window = {
    #[cfg(target_os = "windows")]
    {
      let window = main_window_builder.decorations(false).build().unwrap();
      window
        .set_decorations(true)
        .expect("failed to set decoration of main_window back to true");
      window
    }
    #[cfg(not(target_os = "windows"))]
    {
      main_window_builder.build().unwrap()
    }
  };

  main_window
    .set_title("Chaos Danmu Tool")
    .expect("failed to set title of main_window");

  #[cfg(debug_assertions)]
  {
    main_window
      .set_always_on_top(true)
      .expect("failed to set always on top of main_window");
    main_window.open_devtools();

    #[cfg(target_os = "macos")]
    {
      use crate::utils::window_utils::set_collection_behavior;
      use cocoa::appkit::NSWindowCollectionBehavior;

      set_collection_behavior(
        &main_window,
        true,
        NSWindowCollectionBehavior::NSWindowCollectionBehaviorManaged,
      );
    }
  }

  #[cfg(any(target_os = "windows", target_os = "macos"))]
  apply_vibrancy_effect(&main_window);
}

#[command]
pub fn show_viewer_window(app_handle: tauri::AppHandle) {
  let viewer_window = app_handle.get_window("viewer");

  if let Some(viewer_window) = viewer_window {
    viewer_window.show().expect("failed to show viewer_window");
  } else {
    create_viewer_window(&app_handle)
  }

  run_blocking(
    CommandBroadcastServer::i().broadcast_cmd(ViewerStatusUpdate::new(ViewerStatus::Open).into()),
  )
}

#[command]
pub fn close_viewer_window(app_handle: tauri::AppHandle) {
  let viewer_window = app_handle.get_window("viewer");
  if let Some(viewer_window) = viewer_window {
    viewer_window
      .close()
      .expect("failed to close viewer_window")
  }
}

#[command]
pub fn is_viewer_window_open(app_handle: tauri::AppHandle) -> bool {
  if let Some(window) = app_handle.get_window("viewer") {
    window.is_visible().unwrap_or(false)
  } else {
    false
  }
}

pub fn create_viewer_window(app_handle: &tauri::AppHandle<Wry>) {
  let cfg = Immutable::new(get_cfg!(sync).backend.window.viewer_window.clone());

  let viewer_window = tauri::WindowBuilder::new(
    app_handle,
    "viewer",
    tauri::WindowUrl::App("index.html?windowId=viewer".into()),
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
      run_blocking(modify_cfg(
        |cfg| {
          cfg.backend.window.viewer_window.height = size.height;
          cfg.backend.window.viewer_window.width = size.width;
        },
        true,
      ));
    }
    WindowEvent::Moved(pos) => run_blocking(modify_cfg(
      |cfg| {
        cfg.backend.window.viewer_window.x = pos.x;
        cfg.backend.window.viewer_window.y = pos.y;
      },
      true,
    )),
    WindowEvent::Destroyed => run_blocking(
      CommandBroadcastServer::i()
        .broadcast_cmd(ViewerStatusUpdate::new(ViewerStatus::Close).into()),
    ),
    _ => {}
  });

  viewer_window
    .set_always_on_top(true)
    .expect("failed to set always on top of viewer_window");

  set_visible_on_all_workspaces(&viewer_window, true, true, false);
  #[cfg(target_os = "macos")]
  {
    use crate::utils::window_utils::set_collection_behavior;
    use cocoa::appkit::NSWindowCollectionBehavior;

    set_collection_behavior(
      &viewer_window,
      true,
      NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary,
    );
  }

  let _ = window_shadows::set_shadow(viewer_window, false);
}

static VIBRANCY_APPLIED: RwLock<bool> = RwLock::const_new(false);

#[cfg(any(target_os = "windows", target_os = "macos"))]
pub fn apply_vibrancy_effect(window: &tauri::Window<Wry>) {
  let result;

  #[cfg(target_os = "macos")]
  {
    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

    result = apply_vibrancy(
      window,
      NSVisualEffectMaterial::HudWindow,
      Some(NSVisualEffectState::Active),
      None,
    );
  }
  #[cfg(target_os = "windows")]
  {
    use window_vibrancy::apply_mica;

    result = apply_mica(window);
  }

  if result.is_ok() {
    *run_blocking(VIBRANCY_APPLIED.write()) = true;
  }
}

#[command]
pub async fn is_vibrancy_applied() -> bool {
  *VIBRANCY_APPLIED.read().await
}
