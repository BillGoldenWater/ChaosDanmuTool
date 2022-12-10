/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::{App, AppHandle, Assets, Context, Wry};

use crate::app::app_loop::AppLoop;
use crate::app::internal_api::window::show_main_window;
use crate::app_context::AppContext;
use crate::cache::user_info_cache::UserInfoCache;
use crate::command::command_history_manager::CommandHistoryManager;
use crate::config::config_manager::ConfigManager;
use crate::get_cfg;
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::network::http_server::HttpServer;
use crate::utils::debug_utils::init_logger;
use crate::utils::panic_utils::setup_panic_hook;

pub fn on_init<A: Assets>(context: &Context<A>) {
  AppContext::init(context.config().clone());
  init_logger();

  setup_panic_hook();

  tauri::async_runtime::set(tokio::runtime::Handle::current());

  let _ = AppLoop::i();
  let _ = UserInfoCache::i();
  let _ = CommandBroadcastServer::i();
  let _ = CommandHistoryManager::i();
  let _ = ConfigManager::i();
  let _ = DanmuReceiver::i();
  let _ = HttpServer::i();
}

pub async fn on_setup(app: &mut App<Wry>) {
  AppLoop::i().start();

  let asset_resolver = app.asset_resolver();

  let port = get_cfg!().backend.http_server.port;
  HttpServer::i().start(asset_resolver, port).await;
}

pub async fn on_ready(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle.clone());
}

pub async fn on_activate(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle.clone());
}

pub async fn on_exit(_app_handle: &AppHandle<Wry>) {
  AppLoop::i().stop().await;

  if DanmuReceiver::i().is_connected() {
    DanmuReceiver::i().disconnect().await;
  }

  HttpServer::i().stop().await;
  CommandBroadcastServer::i().close_all().await;
  ConfigManager::i().on_exit();
}
