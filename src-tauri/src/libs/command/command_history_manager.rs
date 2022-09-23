/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use log::error;
use std::path::PathBuf;

use tauri::api::path::app_dir;
use tauri::Config;
use tokio::sync::Mutex;

use crate::libs::command::command_history_storage::CommandHistoryStorage;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::utils::fs_utils::get_dir_children_names;
use crate::libs::utils::mutex_utils::{a_lock, lock};

#[derive(static_object::StaticObject)]
pub struct CommandHistoryManager {
  data_dir: PathBuf,

  current_storage: Mutex<Option<CommandHistoryStorage>>,
}

impl CommandHistoryManager {
  fn new() -> Self {
    Self {
      data_dir: PathBuf::new(),

      current_storage: Mutex::new(None),
    }
  }

  fn check_init(&self) {
    if lock(&self.current_storage).is_none() {
      panic!("[CommandHistoryManager] not inited")
    }
  }

  pub async fn init(&mut self, config: &Config) {
    self.data_dir = app_dir(config).unwrap().join("commandHistory");

    *a_lock(&self.current_storage).await = Some(CommandHistoryStorage::new(&self.data_dir).await);
  }

  pub async fn new_file(&mut self) {
    self.check_init();

    *a_lock(&self.current_storage).await = Some(CommandHistoryStorage::new(&self.data_dir).await);
  }

  pub async fn write(
    &mut self,
    command: &CommandPacket,
  ) -> super::command_history_storage::Result<()> {
    self.check_init();

    a_lock(&self.current_storage)
      .await
      .as_mut()
      .unwrap()
      .write(command)
      .await
  }

  pub async fn read(
    &self,
    file_name: &str,
    filters: Vec<(&str, &str)>,
    limit: Option<u32>,
    offset: u32,
  ) -> Vec<CommandPacket> {
    let mut chs = self.get_storage(file_name).await;
    let result = chs.read(filters, limit, offset).await;
    if let Ok(result) = result {
      result
    } else {
      error!(
        "error occurred when reading history {}",
        err = result.unwrap_err()
      );
      vec![]
    }
  }

  pub fn history_storages(&self) -> Vec<String> {
    self.check_init();
    if let Ok(files) = get_dir_children_names(&self.data_dir, true) {
      files
    } else {
      vec![]
    }
  }

  async fn get_storage(&self, file_name: &str) -> CommandHistoryStorage {
    CommandHistoryStorage::open(&self.data_dir.join(file_name)).await
  }
}
