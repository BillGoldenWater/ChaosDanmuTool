/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::network::api_request::bilibili_response::bilibili_get;

use super::bilibili_response;

static ROOM_INFO_API_URL: &str = "https://api.live.bilibili.com/room/v1/Room/room_init";

pub struct RoomInfoGetter {}

impl RoomInfoGetter {
  pub async fn get(room_id: u32) -> bilibili_response::ResponseResult<RoomInfoResponse> {
    let url = format!("{}?id={}", ROOM_INFO_API_URL, room_id);

    bilibili_get(&url).await
  }

  pub async fn get_actual_room_id(room_id: u32) -> Result<u32, Error> {
    let res = Self::get(room_id).await?;

    Ok(res.data.unwrap().room_id)
  }
}

#[derive(Debug, serde::Deserialize)]
pub struct RoomInfoResponse {
  pub room_id: u32,
  pub short_id: u32,
  // unused

  // pub uid: u64,
  // pub need_p2p: u8,
  // pub is_hidden: bool,
  // pub is_locked: bool,
  // pub is_portrait: bool,
  // pub live_status: u8,
  // pub hidden_till: u8,
  // pub lock_till: u8,
  // pub encrypted: bool,
  // pub pwd_verified: bool,
  // pub live_time: i64,
  // pub room_shield: i64,
  // pub is_sp: u8,
  // pub special_type: u8,
}

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("{0}")]
  Request(#[from] bilibili_response::Error<RoomInfoResponse>),
}
