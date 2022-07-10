/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::{path::PathBuf};

use tauri::{Assets, Context};

pub fn get_app_dir<A: Assets>(context: &Context<A>) -> PathBuf {
  let bundle_id = &context.config().tauri.bundle.identifier;
  let app_dir = tauri::api::path::config_dir().unwrap().join(bundle_id);

  app_dir
}

#[cfg(target_os = "macos")]
pub fn get_app_bundle_path() -> Option<PathBuf> {
  let exec_path = std::env::current_exe().unwrap();

  let mac_os_dir = exec_path.parent();
  if !mac_os_dir.map(|dir|
    dir.file_name()
      .map(|name| { name.eq_ignore_ascii_case("MacOS") })
      .unwrap_or(false)
  ).unwrap_or(false) { return None; } // check is in "MacOS"

  let content_dir = mac_os_dir.unwrap().parent();
  if !content_dir.map(|dir|
    dir.file_name()
      .map(|name| name.eq_ignore_ascii_case("Contents"))
      .unwrap_or(false)
  ).unwrap_or(false) { return None; } // check is in "Contents"

  let app_bundle_dir = content_dir.unwrap().parent();
  if let Some(app_bundle_dir) = app_bundle_dir {
    if let Some(dir_name) = app_bundle_dir.file_name() {
      if dir_name.to_str().unwrap_or("").ends_with(".app") { // check is xxxx.app
        return Some(app_bundle_dir.to_path_buf());
      }
    }
  }

  None
}