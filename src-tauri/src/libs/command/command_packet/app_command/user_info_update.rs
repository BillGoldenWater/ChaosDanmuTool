/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::cache::user_info_cache::user_info::UserInfo;

#[derive(serde::Serialize, serde::Deserialize, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
export,
export_to = "../src/share/type/rust/command/commandPacket/appCommand/"
)]
pub struct UserInfoUpdate {
  user_info: UserInfo,
}

impl UserInfoUpdate {
  pub fn new(user_info: UserInfo) -> Self {
    Self { user_info }
  }
}
