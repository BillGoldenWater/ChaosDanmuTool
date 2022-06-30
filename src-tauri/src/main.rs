/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{App, AppHandle, Manager, Wry};

use chaosdanmutool::libs::utils::window_utils::set_visible_on_all_workspaces;

fn create_main_window(app_handle: AppHandle<Wry>) {
  let main_window = tauri::WindowBuilder
  ::new(&app_handle, "main", tauri::WindowUrl::App("index.html".into()))
    .build()
    .unwrap();

  main_window.set_title("Chaos Danmu Tool")
    .expect("Failed to set title of main_window");

  #[cfg(debug_assertions)]{
    main_window.set_always_on_top(true).expect("Failed to set always on top of main_window");
    main_window.open_devtools()
  }

  set_visible_on_all_workspaces(main_window,
                                true,
                                true,
                                false);
}

fn show_main_window(app_handle: AppHandle<Wry>) {
  let main_window = app_handle.get_window("main");

  if let Some(main_window) = main_window {
    main_window.show().expect("Failed to show main_window");
  } else {
    create_main_window(app_handle)
  }
}

fn on_ready(_app_handle: &AppHandle<Wry>) {}

fn on_init(app: &mut App<Wry>) {
  show_main_window(app.app_handle());
}

fn main() {
  let context = tauri::generate_context!();
  let app = tauri::Builder::default()
    .setup(|app| {
      on_init(app);
      Ok(())
    })
    // .invoke_handler(tauri::generate_handler![set_visible_on_all_workspace])
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default("Chaos Danmu Tool")
    } else {
      tauri::Menu::default()
    })
    .build(context)
    .expect("error while building tauri application");

  app
    .run(|app_handle, event| match event {
      tauri::RunEvent::Ready {} => {
        on_ready(app_handle)
      }
      tauri::RunEvent::ExitRequested { api, .. } => {
        #[cfg(target_os = "macos")]
        {
          println!("[RunEvent.ExitRequested] Exit prevented");
          api.prevent_exit()
        }
      }

      _ => {}
    });
}
