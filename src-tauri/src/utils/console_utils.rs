/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn attach_console() {
  #[cfg(target_os = "windows")]
  {
    use windows::Win32::System::Console::{AttachConsole, ATTACH_PARENT_PROCESS};
    unsafe {
      AttachConsole(ATTACH_PARENT_PROCESS);
    }
  }
}

pub fn detach_console() {
  #[cfg(target_os = "windows")]
  {
    use windows::Win32::System::Console::FreeConsole;
    unsafe {
      FreeConsole();
    }
  }
}

pub fn alloc_console() {
  #[cfg(target_os = "windows")]
  {
    use windows::Win32::System::Console::AllocConsole;
    unsafe {
      AllocConsole();
    }
  }
}
