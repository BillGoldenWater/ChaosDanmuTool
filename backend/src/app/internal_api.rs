/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::Wry;

pub mod app;
pub mod cache;
pub mod config_manager;
pub mod danmu_receiver;
pub mod window;

pub fn invoke_handler(invoke: tauri::Invoke<Wry>) {
  invoke_tauri_handlers(
    tauri::generate_handler![
      app::is_debug,
      cache::get_user_info,
      config_manager::get_config,
      config_manager::update_config,
      danmu_receiver::connect_room,
      danmu_receiver::disconnect_room,
      window::is_vibrancy_applied,
      window::show_viewer_window,
      window::close_viewer_window,
      window::is_viewer_window_open
    ],
    invoke,
  )
}

#[inline]
fn invoke_tauri_handlers<F, R: tauri::Runtime>(handler: F, invoke: tauri::Invoke<R>)
where
  F: Fn(tauri::Invoke<R>) + Send + Sync + 'static,
{
  handler(invoke);
}
