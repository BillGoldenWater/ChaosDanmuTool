/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::command_packet::bilibili_command::gift_message::coin_type::CoinType;
use crate::command_packet::bilibili_command::{FromRawCommand, ItemWithUserInfo};
use crate::types::bilibili::bilibili_message::send_gift::SendGift;
use crate::types::user_info::UserInfo;

mod coin_type;

#[derive(serde::Serialize, serde::Deserialize, Default, PartialEq, Eq, Debug, Clone)]
#[serde(rename_all = "camelCase")]
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

impl FromRawCommand<SendGift> for GiftMessage {
  fn from_raw_command(raw: SendGift) -> ItemWithUserInfo<Self> {
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

    ItemWithUserInfo::new(
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
      },
      user_info,
    )
  }
}
