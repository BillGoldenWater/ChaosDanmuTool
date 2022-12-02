/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn attach_console() {
  #[cfg(target_os = "windows")]
  {
    use winapi::um::wincon::{AttachConsole, ATTACH_PARENT_PROCESS};
    unsafe {
      AttachConsole(ATTACH_PARENT_PROCESS);
    }
  }
}

pub fn detach_console() {
  #[cfg(target_os = "windows")]
  {
    use winapi::um::wincon::FreeConsole;
    unsafe {
      FreeConsole();
    }
  }
}
