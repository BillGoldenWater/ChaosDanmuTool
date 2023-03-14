/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use static_object::StaticObject;

use crate::cache::user_info_cache::user_info::UserInfo;
use crate::cache::user_info_cache::UserInfoCache;
use crate::command::command_packet::bilibili_command::gift_message::coin_type::CoinType;
use crate::command::command_packet::bilibili_command::FromRawCommand;
use crate::types::bilibili::bilibili_message::send_gift::SendGift;

mod coin_type;

#[derive(serde::Serialize, serde::Deserialize, Default, ts_rs::TS, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(
  export,
  export_to = "../frontend/src/share/type/rust/command/commandPacket/bilibiliCommand/"
)]
pub struct GiftMessage {
  gift_id: u32,
  gift_name: String,
  coin_type: CoinType,
  price: u32,
  num: u32,
  action: String,
  uid: String,

  timestamp: String,
  dmscore: u32,
}

#[async_trait::async_trait]
impl FromRawCommand<SendGift> for GiftMessage {
  async fn from_raw_command(raw: SendGift) -> Self
  where
    Self: Sized,
  {
    let user_info = UserInfo {
      uid: raw.uid.to_string(),
      name: Some(raw.uname),
      user_level: None,
      face: Some(raw.face),
      face_frame: None,
      is_vip: None,
      is_svip: None,
      is_main_vip: None,
      is_manager: None,
      title: None,
      level_color: None,
      name_color: Some(raw.name_color),
      medal: Some(raw.medal_info.into()),
    };

    UserInfoCache::i().update(user_info).await;

    Self {
      gift_id: raw.gift_id,
      gift_name: raw.gift_name,
      coin_type: raw.coin_type.into(),
      price: raw.price,
      num: raw.num,
      action: raw.action,
      uid: raw.uid.to_string(),
      timestamp: raw.timestamp.to_string(),
      dmscore: raw.dmscore,
    }
  }
}
