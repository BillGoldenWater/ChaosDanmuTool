/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde_json::Value;

#[derive(Debug, serde::Deserialize)]
pub struct DanmuMsg {
  pub is_special: bool,
  pub dm_v2: Option<String>,
  pub info: Vec<Value>,
}
