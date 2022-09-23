/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::de::DeserializeOwned;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct BiliBiliResponse<Data> {
  pub code: Option<i32>,
  pub message: Option<String>,
  pub msg: Option<String>,
  pub ttl: Option<i32>,
  pub data: Option<Data>,
}

pub async fn execute_request<T: DeserializeOwned>(uri: &str) -> Result<BiliBiliResponse<T>> {
  let result = reqwest::get(uri).await?;

  let text = result.text().await?;

  Ok(serde_json::from_str(&text)?)
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to make request: {0}")]
  Reqwest(#[from] reqwest::Error),
  #[error("failed to parse response")]
  SerdeJson(#[from] serde_json::Error),
}
