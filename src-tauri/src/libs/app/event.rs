/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::{App, AppHandle, Assets, Context, Wry};

use crate::get_cfg;
use crate::libs::app::app_loop::AppLoop;
use crate::libs::app::internal_api::window::show_main_window;
use crate::libs::app_context::AppContext;
use crate::libs::config::config_manager::ConfigManager;
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::libs::network::http_server::HttpServer;
use crate::libs::utils::debug_utils::init_logger;

pub fn on_init<A: Assets>(context: &Context<A>) {
  AppContext::init(context.config().clone());
  init_logger();

  tauri::async_runtime::set(tokio::runtime::Handle::current());

  let _ = AppLoop::i();
  let _ = CommandBroadcastServer::i();
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
