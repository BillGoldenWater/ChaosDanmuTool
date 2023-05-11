/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::types::user_info::UserInfo;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserInfoUpdate {
  user_info: UserInfo,
}

impl UserInfoUpdate {
  pub fn new(user_info: UserInfo) -> Self {
    Self { user_info }
  }
}
