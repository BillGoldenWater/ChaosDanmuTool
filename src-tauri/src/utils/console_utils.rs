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
      enable_virtual_terminal_processing();
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
      enable_virtual_terminal_processing();
    }
  }
}

#[cfg(target_os = "windows")]
fn enable_virtual_terminal_processing() {
  use windows::Win32::System::Console::{
    GetConsoleMode, GetStdHandle, SetConsoleMode, CONSOLE_MODE, ENABLE_PROCESSED_OUTPUT,
    ENABLE_VIRTUAL_TERMINAL_PROCESSING, STD_OUTPUT_HANDLE,
  };

  unsafe {
    let console = GetStdHandle(STD_OUTPUT_HANDLE);
    if let Ok(h_console) = console {
      let mut console_mode: CONSOLE_MODE = CONSOLE_MODE(0);
      GetConsoleMode(h_console, &mut console_mode);
      SetConsoleMode(
        h_console,
        console_mode | ENABLE_PROCESSED_OUTPUT | ENABLE_VIRTUAL_TERMINAL_PROCESSING,
      );
    }
  }
}
