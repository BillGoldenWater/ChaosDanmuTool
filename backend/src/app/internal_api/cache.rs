/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::command;

use chaos_danmu_tool_share::types::user_info::UserInfo;

use crate::cache::user_info_cache::UserInfoCache;

#[command]
pub async fn get_user_info(uid: String) -> Option<UserInfo> {
  UserInfoCache::i().get(&uid).await
}
