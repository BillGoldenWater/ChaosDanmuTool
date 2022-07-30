/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use rfd::{MessageButtons, MessageLevel};
use tauri::{Assets, Context};
use tauri::api::file::read_string;
use tokio::sync::Mutex;

use crate::{info, location_info};
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::libs::config::config::{Config, serialize_config};
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::utils::fs_utils::get_app_data_dir;

lazy_static! {
    pub static ref CONFIG_MANAGER_STATIC_INSTANCE: Mutex<ConfigManager> =
        Mutex::new(ConfigManager::new());
}

pub struct ConfigManager {
  app_dir: Option<PathBuf>,
  config_file_path: Option<PathBuf>,
  config: Config,
  last_save_ts: Instant,
  changed: bool,
}

impl ConfigManager {
  fn new() -> ConfigManager {
    ConfigManager {
      app_dir: None,
      config_file_path: None,
      config: serde_json::from_str("{}").unwrap(),
      last_save_ts: Instant::now(),
      changed: false,
    }
  }

  pub async fn init<A: Assets>(context: &Context<A>) {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;

    this.app_dir = Some(get_app_data_dir(context));

    let mut config_file_path = get_app_data_dir(context);
    config_file_path.push("config.json");
    this.config_file_path = Some(config_file_path);

    this.load_().await;
  }

  pub async fn load() {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    info!("load manually");
    this.load_().await;
  }

  async fn load_(&mut self) {
    if self.config_file_path.is_none() {
      return;
    }

    let result = read_string(self.config_file_path.as_ref().unwrap().as_path());
    let config_str;
    if let Err(err) = result {
      if !is_not_found(&err) {
        rfd::MessageDialog::new()
          .set_title("错误")
          .set_level(MessageLevel::Error)
          .set_buttons(MessageButtons::OkCustom("确定".to_string()))
          .set_description(format!("无法读取配置文件.\n{}", location_info!()).as_str())
          .show();
        std::process::exit(0);
      }
      config_str = "{}".to_string();
    } else {
      config_str = result.unwrap();
    }

    let parse_result = serde_json::from_str(config_str.as_str());

    if let Err(_err) = parse_result {
      let reset = rfd::MessageDialog::new()
        .set_title("错误")
        .set_level(MessageLevel::Error)
        .set_buttons(MessageButtons::OkCancelCustom("重置".to_string(), "退出".to_string()))
        .set_description(format!("无法解析配置文件.\n重置配置文件或退出?\n{}", location_info!()).as_str())
        .show();
      if reset {
        self.reset_(true).await;
        return;
      } else {
        std::process::exit(0);
      }
    }

    self.config = parse_result.unwrap();
  }

  pub async fn save() {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    info!("save manually");
    this.save_();
  }

  fn save_(&mut self) {
    if let Some(app_dir) = &self.app_dir {
      if let Some(path) = &self.config_file_path {
        info!("save config");
        let result = fs::create_dir_all(app_dir);
        if let Err(err) = result {
          info!("failed to create data folder\n{:#?}",err);
          return;
        }
        let result = fs::write(
          path.as_path(),
          serialize_config(&self.config, true),
        );
        if let Err(err) = result {
          info!("failed to write config file\n{:#?}",err);
          return;
        }
        self.changed = false;
        self.last_save_ts = Instant::now();
        info!("config successfully saved");
      }
    }
  }

  pub async fn reset(force: bool) {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    this.reset_(force).await
  }

  async fn reset_(&mut self, force: bool) {
    let button = MessageButtons::OkCancelCustom(
      "重置".to_string(),
      if force { "退出".to_string() } else { "取消".to_string() },
    );

    let reset = rfd::MessageDialog::new()
      .set_title("警告")
      .set_level(MessageLevel::Warning)
      .set_buttons(button)
      .set_description(format!("重置配置文件将会丢失所有的自定义设置!\n{}", location_info!()).as_str())
      .show();
    if !reset {
      if force {
        std::process::exit(0);
      } else {
        return;
      }
    }

    info!("reset config");
    self.set_config_(serde_json::from_str("{}").unwrap(), true).await;
    self.save_();
  }

  pub async fn get_config() -> Config {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    this.get_config_()
  }

  fn get_config_(&mut self) -> Config {
    self.config.clone()
  }

  pub async fn set_config(config: Config, broadcast: bool) {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    this.set_config_(config, broadcast).await
  }

  async fn set_config_(&mut self, config: Config, broadcast: bool) {
    self.config = config;
    self.on_change_(broadcast).await;
  }

  pub async fn tick() {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    this.tick_().await
  }

  async fn tick_(&mut self) {
    if self.config.backend.config_manager.save_on_change {
      if self.changed && self.last_save_ts.elapsed().as_secs() >= 5 {
        info!("save on change");
        self.save_();
      }
    }
  }

  async fn on_change_(&mut self, broadcast: bool) {
    self.changed = true;
    if broadcast {
      CommandBroadcastServer::broadcast_app_command(
        AppCommand::from_config_update(
          ConfigUpdate::new(self.config.clone())
        )
      ).await;
    }
  }

  pub async fn on_exit() {
    let this = &mut *CONFIG_MANAGER_STATIC_INSTANCE.lock().await;
    this.on_exit_()
  }

  fn on_exit_(&mut self) {
    if self.config.backend.config_manager.save_on_exit {
      info!("save on exit");
      self.save_();
    }
  }
}

fn is_not_found(err: &tauri::api::Error) -> bool {
  if let tauri::api::Error::Io(err) = err {
    if err.kind() == std::io::ErrorKind::NotFound {
      return true;
    }
  }
  false
}