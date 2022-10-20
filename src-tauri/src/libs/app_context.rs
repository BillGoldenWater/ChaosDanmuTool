/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::Config;

use crate::libs::utils::trace_utils::print_trace;

static mut TAURI_CONFIG: *const Config = 0 as *const Config;

pub fn init_tauri_config(config: Config) {
  use std::sync::Once;

  static ONCE: Once = Once::new();

  ONCE.call_once(|| unsafe { TAURI_CONFIG = Box::leak(Box::new(config)) });
}

pub fn tauri_config() -> Config {
  unsafe {
    if TAURI_CONFIG == 0 as *const Config {
      print_trace();
      panic!("get before init")
    }
  }

  unsafe { (*TAURI_CONFIG).clone() }
}
