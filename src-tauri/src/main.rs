#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{AppHandle, Manager, Wry};

fn create_main_window(app_handle: &AppHandle<Wry>) {
  let main_window = app_handle.get_window("main");

  if let Some(main_window) = main_window {
    if main_window.is_visible().unwrap() {
      main_window.close()
        .expect("Failed to close main_window");
    }
    main_window.show()
      .expect("Failed to show main_window");
  }
}

fn on_ready(app_handle: &AppHandle<Wry>) {
  create_main_window(app_handle);

  #[cfg(debug_assertions)]
  {
    let window = app_handle.get_window("main");
    if let Some(window) = window {
      window.set_always_on_top(true).unwrap()
    }
  }
}

fn main() {
  let context = tauri::generate_context!();
  let app = tauri::Builder::default()
    .menu(tauri::Menu::os_default(&context.package_info().name))
    .setup(|app| {
      let main_window = tauri::WindowBuilder::new(app, "main", tauri::WindowUrl::App("index.html".into()))
        .build()
        .unwrap();

      main_window.set_title("Chaos Danmu Tool")
        .expect("Failed to set title of main_window");
      Ok(())
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
