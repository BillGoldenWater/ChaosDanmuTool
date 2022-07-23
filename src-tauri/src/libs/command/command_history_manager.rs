/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::{path::PathBuf, sync::Mutex};

use tauri::{Assets, Context};

use crate::libs::command::command_history_storage::CommandHistoryStorage;
use crate::libs::utils::fs_utils::{get_app_data_dir, get_dir_children_names};

lazy_static! {
  pub static ref COMMAND_HISTORY_MANAGER_STATIC_INSTANCE: Mutex<CommandHistoryManager> = Mutex::new(CommandHistoryManager::new());
}

pub struct CommandHistoryManager {
  inited: bool,

  data_dir: PathBuf,
  current_storage: CommandHistoryStorage,
}

impl CommandHistoryManager {
  fn new() -> CommandHistoryManager {
    CommandHistoryManager {
      inited: false,

      data_dir: PathBuf::new(),
      current_storage: CommandHistoryStorage::new(PathBuf::from("/")),
    }
  }

  fn check_init(&self) {
    if !self.inited {
      panic!("[CommandHistoryManager] not inited")
    }
  }

  pub fn init<A: Assets>(context: &Context<A>) {
    let this = &mut *COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.init_(context)
  }

  fn init_<A: Assets>(&mut self, context: &Context<A>) {
    self.data_dir = get_app_data_dir(context).join(".commandHistory");

    self.current_storage = CommandHistoryStorage::new(self.data_dir.clone());
    self.inited = true;
  }

  pub fn new_file() {
    let this = &mut *COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.new_file_()
  }

  fn new_file_(&mut self) {
    self.check_init();
    self.current_storage = CommandHistoryStorage::new(self.data_dir.clone());
  }

  pub async fn write(command: String) {
    let this = &mut *COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.write_(command).await
  }

  async fn write_(&mut self, command: String) {
    self.check_init();
    self.current_storage.write(command).await;
  }

  pub fn history_storages() -> Vec<String> {
    let this = &*COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.history_storages_()
  }

  fn history_storages_(&self) -> Vec<String> {
    self.check_init();
    if let Ok(files) = get_dir_children_names(&self.data_dir, true) {
      files
    } else {
      vec![]
    }
  }

  pub async fn get_len(storage_id: String) -> u64 {
    let this = &*COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.get_len_(storage_id).await
  }

  async fn get_len_(&self, storage_id: String) -> u64 {
    CommandHistoryStorage::from_folder(
      self.data_dir.join(storage_id)
    )
      .await.len()
  }

  pub async fn read(storage_id: String, start_index: u64, end_index: u64) -> Vec<String> {
    let this = &*COMMAND_HISTORY_MANAGER_STATIC_INSTANCE.lock().unwrap();
    this.read_(storage_id, start_index, end_index).await
  }

  async fn read_(&self, storage_id: String, start_index: u64, end_index: u64) -> Vec<String> {
    let chs = CommandHistoryStorage::from_folder(
      self.data_dir.join(storage_id)
    ).await;

    chs.read(start_index, end_index).await
  }
}