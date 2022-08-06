/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::libs::network::api_request::bilibili_response::{execute_request, BiliBiliResponse};

static ROOM_INFO_API_URL: &str = "https://api.live.bilibili.com/room/v1/Room/room_init";

pub struct RoomInfoGetter {}

impl RoomInfoGetter {
  pub async fn get(room_id: u32) -> Option<BiliBiliResponse<RoomInfoResponse>> {
    let url = format!("{}?id={}", ROOM_INFO_API_URL, room_id);

    execute_request(&url).await
  }

  pub async fn get_actual_room_id(room_id: u32) -> Option<u32> {
    let data = Self::get(room_id).await?;

    Some(data.data?.room_id)
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
