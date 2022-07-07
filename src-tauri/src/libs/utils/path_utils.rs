/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::{path::PathBuf};

use tauri::{Assets, Context};

pub fn get_app_dir<A: Assets>(context: &Context<A>) -> PathBuf {
  let bundle_id = &context.config().tauri.bundle.identifier;
  let app_dir = tauri::api::path::config_dir().unwrap().join(bundle_id);

  app_dir
}