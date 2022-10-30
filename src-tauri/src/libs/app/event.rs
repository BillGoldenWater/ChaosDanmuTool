/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::api::path::app_dir;
use tauri::{App, AppHandle, Assets, Context, Wry};

use crate::get_cfg;
use crate::libs::app::app_loop::AppLoop;
use crate::libs::app::internal_api::window::show_main_window;
use crate::libs::config::config_manager::ConfigManager;
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;
use crate::libs::network::http_server::HttpServer;

pub async fn on_init<A: Assets>(context: &Context<A>) {
  std::fs::create_dir_all(app_dir(&context.config()).unwrap())
    .expect("unable to create app data dir");

  let _ = AppLoop::i();
  let _ = CommandBroadcastServer::i();
  let _ = ConfigManager::i();
  let _ = DanmuReceiver::i();
  let _ = HttpServer::i();

  AppLoop::i().start();
}

pub async fn on_tauri_setup(app: &mut App<Wry>) {
  let asset_resolver = app.asset_resolver();

  let port = get_cfg!().backend.http_server.port.clone();
  HttpServer::i().start(asset_resolver, port).await;
}

pub async fn on_ready(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle.clone()).await;
}

pub async fn on_activate(app_handle: &AppHandle<Wry>) {
  show_main_window(app_handle.clone()).await;
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
