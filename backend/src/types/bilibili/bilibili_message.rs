/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use serde::de::{DeserializeOwned, Error as DeError};
use serde::{Deserialize, Deserializer};
use serde_json::Value;

use crate::types::bilibili::bilibili_message::danmu_msg::DanmuMsg;
use crate::types::bilibili::bilibili_message::send_gift::SendGift;

pub mod danmu_msg;
pub mod send_gift;

#[derive(Debug)]
pub enum BiliBiliMessage {
  DanmuMsg(DanmuMsg),
  SendGift(Box<SendGift>),
  Raw(Value),
}

impl<'de> Deserialize<'de> for BiliBiliMessage {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    let mut value = Value::deserialize(deserializer)?;

    let msg = match value.as_object_mut() {
      None => Err(DeError::custom(format!(
        "unexpected non object data: {value:#?}"
      ))),
      Some(msg) => Ok(msg),
    }?;

    let cmd = msg
      .get("cmd")
      .ok_or_else(|| DeError::missing_field("cmd"))?
      .as_str()
      .ok_or_else(|| DeError::custom("non string value in cmd field"))?;

    fn take_into<T: DeserializeOwned, E>(
      obj: &mut serde_json::Map<String, Value>,
      field_name: &'static str,
    ) -> Result<T, E>
    where
      E: DeError,
    {
      let data = obj
        .get_mut(field_name)
        .ok_or_else(|| DeError::missing_field(field_name))?;
      serde_json::from_value::<T>(data.take()).map_err(DeError::custom)
    }

    let result = match cmd {
      "SEND_GIFT" => {
        BiliBiliMessage::SendGift(Box::from(take_into::<SendGift, D::Error>(msg, "data")?))
      }

      cmd => {
        if cmd.starts_with("DANMU_MSG") {
          let is_special = !cmd.eq("DANMU_MSG");
          BiliBiliMessage::DanmuMsg(DanmuMsg {
            info: take_into(msg, "info")?,
            is_special,
          })
        } else {
          BiliBiliMessage::Raw(value)
        }
      }
    };

    Ok(result)
  }
}
