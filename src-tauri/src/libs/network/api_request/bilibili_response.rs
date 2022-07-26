/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::de::DeserializeOwned;
use serde::Deserialize;

use crate::lprintln;

#[derive(Debug, Deserialize)]
pub struct BiliBiliResponse<Data> {
  pub code: Option<i32>,
  pub message: Option<String>,
  pub msg: Option<String>,
  pub ttl: Option<i32>,
  pub data: Option<Data>,
}

pub async fn execute_request<T: DeserializeOwned>(uri: &str) -> Option<BiliBiliResponse<T>> {
  let result = reqwest::get(uri).await;
  if result.is_err() {
    return None;
  }

  let text_result = result.unwrap().text().await;
  if text_result.is_err() {
    return None;
  }

  let text = text_result.unwrap();

  let serde_result = serde_json::from_str(&text);

  if serde_result.is_err() {
    lprintln!("failed parsing: {}", text);
  }

  Some(serde_result.unwrap())
}
