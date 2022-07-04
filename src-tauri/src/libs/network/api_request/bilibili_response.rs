/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct BiliBiliResponse<Data> {
  pub code: Option<i32>,
  pub message: Option<String>,
  pub msg: Option<String>,
  pub ttl: Option<i32>,
  pub data: Option<Data>,
}
