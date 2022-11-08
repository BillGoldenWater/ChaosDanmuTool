/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

use log::{error, info};
use rfd::{MessageButtons, MessageLevel};
use static_object::StaticObject;
use tauri::api::file::read_string;
use tokio::sync::{Mutex, MutexGuard};

use crate::libs::app_context::AppContext;
use crate::libs::command::command_packet::app_command::config_update::ConfigUpdate;
use crate::libs::command::command_packet::app_command::AppCommand;
use crate::libs::config::config::{serialize_config, Config};
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::utils::async_utils::run_blocking;
use crate::libs::utils::immutable_utils::Immutable;
use crate::libs::utils::mutex_utils::{a_lock, lock};
use crate::location_info;

#[derive(StaticObject)]
pub struct ConfigManager {
  config_file_path: PathBuf,

  config: Arc<Mutex<Config>>,
  last_save_ts: Mutex<Instant>,
  changed: Mutex<bool>,
}

impl ConfigManager {
  pub fn new() -> ConfigManager {
    let config_file_path = AppContext::i().data_dir.join("config.json");

    let mut this = ConfigManager {
      config_file_path,
      config: wrap_cfg(serde_json::from_str("{}").unwrap()),
      last_save_ts: Mutex::new(Instant::now()),
      changed: Mutex::new(false),
    };

    run_blocking(this.load());

    this
  }

  pub async fn load(&mut self) {
    let result = read_string(&self.config_file_path);
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
        .set_buttons(MessageButtons::OkCancelCustom(
          "重置".to_string(),
          "退出".to_string(),
        ))
        .set_description(
          format!(
            "无法解析配置文件.\n重置配置文件或退出?\n{}",
            location_info!()
          )
          .as_str(),
        )
        .show();
      if reset {
        self.reset(true).await;
        return;
      } else {
        std::process::exit(0);
      }
    }

    *a_lock(&self.config).await = parse_result.unwrap()
  }

  pub fn save(&mut self) {
    let mut changed = lock(&self.changed);

    info!("save config");
    let result = fs::write(
      self.config_file_path.as_path(),
      serialize_config(&*lock(&self.config), true),
    );
    if let Err(err) = result {
      error!("failed to write config file\n{:#?}", err);
      return;
    }
    *changed = false;
    *lock(&self.last_save_ts) = Instant::now();
    info!("config successfully saved");

    drop(changed);
  }

  pub async fn reset(&mut self, force: bool) {
    let button = MessageButtons::OkCancelCustom(
      "重置".to_string(),
      if force {
        "退出".to_string()
      } else {
        "取消".to_string()
      },
    );

    let reset = rfd::MessageDialog::new()
      .set_title("警告")
      .set_level(MessageLevel::Warning)
      .set_buttons(button)
      .set_description(
        format!(
          "重置配置文件将会丢失所有的自定义设置!\n{}",
          location_info!()
        )
        .as_str(),
      )
      .show();
    if !reset {
      if force {
        std::process::exit(0);
      } else {
        return;
      }
    }

    info!("reset config");
    *a_lock(&self.config).await = serde_json::from_str("{}").unwrap();
    self.on_change(true).await;
    self.save();
  }

  fn get_config(&self) -> Arc<Mutex<Config>> {
    Arc::clone(&self.config)
  }

  pub fn get_readonly_config(&self) -> Immutable<Config> {
    Immutable::new(lock(&self.config).clone())
  }

  async fn on_change(&mut self, broadcast: bool) {
    *a_lock(&self.changed).await = true;
    if broadcast {
      CommandBroadcastServer::i()
        .broadcast_app_command(AppCommand::from_config_update(ConfigUpdate::new(
          &*a_lock(&self.config).await,
        )))
        .await;
    }
  }

  pub async fn tick(&mut self) {
    if a_lock(&self.config)
      .await
      .backend
      .config_manager
      .save_on_change
    {
      if *a_lock(&self.changed).await && a_lock(&self.last_save_ts).await.elapsed().as_secs() >= 5 {
        info!("save on change");
        self.save();
      }
    }
  }

  pub fn on_exit(&mut self) {
    if lock(&self.config).backend.config_manager.save_on_exit {
      info!("save on exit");
      self.save();
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

fn wrap_cfg(config: Config) -> Arc<Mutex<Config>> {
  Arc::new(Mutex::new(config))
}

#[macro_export]
#[allow(unused_macros)]
macro_rules! get_cfg {
  () => {{
    use static_object::StaticObject;
    ConfigManager::i().get_readonly_config()
  }};
}

pub async fn modify_cfg<F>(do_modify: F, broadcast: bool)
where
  F: FnOnce(&mut MutexGuard<'_, Config>),
{
  let cfg_m = ConfigManager::i();

  let config = cfg_m.get_config();
  let mut cfg = a_lock(&config).await;
  do_modify(&mut cfg);
  drop(cfg);
  drop(config);

  cfg_m.on_change(broadcast).await;
}
