/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::path::PathBuf;

use tauri::{Assets, Context};

use crate::error;
use crate::libs::command::command_history_storage::CommandHistoryStorage;
use crate::libs::command::command_packet::CommandPacket;
use crate::libs::utils::fs_utils::{get_app_data_dir, get_dir_children_names};

#[derive(static_object::StaticObject)]
pub struct CommandHistoryManager {
  inited: bool,

  data_dir: PathBuf,
  current_storage: CommandHistoryStorage,
}

impl CommandHistoryManager {
  fn new() -> Self {
    todo!("thread safe");
    Self {
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

  pub fn init<A: Assets>(&mut self, context: &Context<A>) {
    self.data_dir = get_app_data_dir(context).join(".commandHistory");

    self.current_storage = CommandHistoryStorage::new(self.data_dir.clone());
    self.inited = true;
  }

  pub fn new_file(&mut self) {
    self.check_init();
    self.current_storage = CommandHistoryStorage::new(self.data_dir.clone());
  }

  pub async fn write(&mut self, command: &CommandPacket) {
    self.check_init();
    let command_str_result = serde_json::to_string(&command);

    if let Ok(str) = command_str_result {
      self.current_storage.write(str).await;
    } else {
      error!("failed to serialize command {:?}", command_str_result)
    }
  }

  pub async fn read(
    &self,
    storage_id: &str,
    start_index: u64,
    end_index: u64,
  ) -> Vec<CommandPacket> {
    let chs = self.get_storage(storage_id).await;

    chs
      .read(start_index, end_index)
      .await
      .iter()
      .filter_map(|v| serde_json::from_str(v).ok())
      .collect()
  }

  pub fn history_storages(&self) -> Vec<String> {
    self.check_init();
    if let Ok(files) = get_dir_children_names(&self.data_dir, true) {
      files
    } else {
      vec![]
    }
  }

  pub async fn get_len(&self, storage_id: &str) -> u64 {
    self.get_storage(storage_id).await.len()
  }

  async fn get_storage(&self, storage_id: &str) -> CommandHistoryStorage {
    CommandHistoryStorage::from_folder(self.data_dir.join(storage_id)).await
  }
}
