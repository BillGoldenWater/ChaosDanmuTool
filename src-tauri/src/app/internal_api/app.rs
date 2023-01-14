/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use tauri::command;

#[command]
pub async fn is_debug() -> bool {
  cfg!(debug_assertions)
}
