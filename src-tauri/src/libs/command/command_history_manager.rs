/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::{sync::Mutex, path::PathBuf};

use tauri::{Assets, Context};

use crate::libs::utils::fs_utils::get_app_data_dir;

lazy_static! {
  pub static ref COMMAND_HISTORY_MANAGER_STATIC_INSTANCE: Mutex<CommandHistoryManager> = Mutex::new(CommandHistoryManager::new());
}

pub struct CommandHistoryManager {
  data_dir: Option<PathBuf>,
}

impl CommandHistoryManager {
  fn new() -> CommandHistoryManager {
    CommandHistoryManager {
      data_dir: None,
    }
  }

  pub fn init_<A: Assets>(&mut self, context: &Context<A>) {
    self.data_dir = Some(get_app_data_dir(context).join(".commandHistory"));

    
  }
}