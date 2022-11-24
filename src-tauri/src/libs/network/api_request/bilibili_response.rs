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

pub async fn bilibili_get<T: DeserializeOwned>(uri: &str) -> ResponseResult<T> {
  let res: BiliBiliResponse<T> = bilibili_get_unchecked::<T>(uri).await?;

  if res.data.is_none() {
    return Err(Error::EmptyData(Box::from(res)));
  }

  Ok(res)
}

pub async fn bilibili_get_unchecked<T: DeserializeOwned>(
  uri: &str,
) -> ResponseResult<T> {
  let result = reqwest::get(uri).await?;

  let text = result.text().await?;

  let res = serde_json::from_str(&text)?;

  Ok(res)
}

pub type ResponseResult<ResponseData> = Result<BiliBiliResponse<ResponseData>, Error<ResponseData>>;

#[derive(thiserror::Error, Debug)]
pub enum Error<ResponseData> {
  #[error("failed to make request: {0}")]
  Reqwest(#[from] reqwest::Error),
  #[error("failed to parse response")]
  SerdeJson(#[from] serde_json::Error),
  #[error("unexpected response with empty data \n{0:?}")]
  EmptyData(Box<BiliBiliResponse<ResponseData>>),
}
