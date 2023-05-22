/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

use chaos_danmu_tool_share::command_packet::app_command::config_update::ConfigUpdate;
use chaos_danmu_tool_share::config::Config;
use log::{error, info};
use static_object::StaticObject;
use tauri::api::file::read_string;
use tokio::sync::{Mutex, MutexGuard};

use crate::app_context::AppContext;
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::utils::async_utils::run_blocking;
use crate::utils::immutable_utils::Immutable;
use crate::utils::mutex_utils::a_lock;
use crate::{dialog_ask, dialog_notice};

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
        error!("unable to read config file {err:?}");
        dialog_notice!(@error, "无法读取配置文件");
        std::process::exit(0);
      }
      config_str = "{}".to_string();
    } else {
      config_str = result.unwrap();
    }

    let parse_result = serde_json::from_str(config_str.as_str());

    if let Err(err) = parse_result {
      error!("unable to parse config \n{err:?}");
      let reset = dialog_ask!(@error, "无法解析配置文件.\n重置配置文件或退出?", @o "重置".to_string(), @c "退出".to_string());
      if reset {
        self.reset(true).await;
        return;
      } else {
        std::process::exit(0);
      }
    }

    *a_lock("cm_cfg", &self.config).await = parse_result.unwrap()
  }

  pub async fn save(&mut self) {
    let mut changed = a_lock("cm_changed",&self.changed).await;

    info!("save config");
    let result = fs::write(
      self.config_file_path.as_path(),
      a_lock("cm_cfg",&self.config).await.to_string(),
    );
    if let Err(err) = result {
      error!("failed to write config file\n{:#?}", err);
      return;
    }
    *changed = false;
    *a_lock("cm_lSTs",&self.last_save_ts).await = Instant::now();
    info!("config successfully saved");

    drop(changed);
  }

  pub async fn reset(&mut self, force: bool) {
    let cancel_txt = if force {
      "退出".to_string()
    } else {
      "取消".to_string()
    };

    let reset = dialog_ask!(@warn, "重置配置文件将会丢失所有的自定义设置!", @o "重置".to_string(), @c cancel_txt);
    if !reset {
      if force {
        std::process::exit(0);
      } else {
        return;
      }
    }

    info!("reset config");
    *a_lock("cm_cfg",&self.config).await = serde_json::from_str("{}").unwrap();
    self.on_change(true).await;
    self.save().await;
  }

  fn get_config(&self) -> Arc<Mutex<Config>> {
    Arc::clone(&self.config)
  }

  pub async fn get_readonly_config(&self) -> Immutable<Config> {
    Immutable::new(a_lock("cm_cfg",&self.config).await.clone())
  }

  async fn on_change(&mut self, broadcast: bool) {
    *a_lock("cm_cfg",&self.changed).await = true;
    if broadcast {
      CommandBroadcastServer::i()
        .broadcast_cmd(ConfigUpdate::new(a_lock("cm_cfg",&self.config).await.clone()).into())
        .await;
    }
  }

  pub async fn tick(&mut self) {
    #[allow(clippy::collapsible_if)]
    if a_lock("cm_cfg",&self.config)
      .await
      .backend
      .config_manager
      .save_on_change
    {
      if *a_lock("cm_changed",&self.changed).await && a_lock("cm_lSTs",&self.last_save_ts).await.elapsed().as_secs() >= 5 {
        info!("save on change");
        self.save().await;
      }
    }
  }

  pub async fn on_exit(&mut self) {
    if a_lock("cm_cfg",&self.config)
      .await
      .backend
      .config_manager
      .save_on_exit
    {
      info!("save on exit");
      self.save().await;
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
    $crate::app::config_manager::ConfigManager::i().get_readonly_config().await
  }};
  (sync) => {{
    use static_object::StaticObject;
    $crate::utils::async_utils::run_blocking($crate::app::config_manager::ConfigManager::i().get_readonly_config())
  }};
}

pub async fn modify_cfg<F>(do_modify: F, broadcast: bool)
where
  F: FnOnce(&mut MutexGuard<'_, Config>),
{
  let cfg_m = ConfigManager::i();

  let config = cfg_m.get_config();
  let mut cfg = a_lock("cm_mc_cfg",&config).await;
  do_modify(&mut cfg);
  drop(cfg);
  drop(config);

  cfg_m.on_change(broadcast).await;
}
