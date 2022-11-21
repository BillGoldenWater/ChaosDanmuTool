/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;
use tauri::command;

use crate::libs::cache::user_info_cache::user_info::UserInfo;
use crate::libs::cache::user_info_cache::UserInfoCache;

#[command]
pub async fn get_user_info(uid: String) -> Option<UserInfo> {
  UserInfoCache::i().get(&uid).await
}
