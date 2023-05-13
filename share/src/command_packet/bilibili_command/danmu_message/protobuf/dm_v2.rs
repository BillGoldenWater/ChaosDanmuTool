/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// modified from quick_protobuf generated code
use std::borrow::Cow;

use quick_protobuf::{BytesReader, MessageRead, Result};

#[derive(Debug, Default, PartialEq, Clone)]
pub struct DMv2<'a> {
  pub user_info: Option<UserInfo<'a>>,
}

impl<'a> MessageRead<'a> for DMv2<'a> {
  fn from_reader(r: &mut BytesReader, bytes: &'a [u8]) -> Result<Self> {
    let mut msg = Self::default();
    while !r.is_eof() {
      match r.next_tag(bytes) {
        Ok(162) => msg.user_info = Some(r.read_message::<UserInfo>(bytes)?),
        Ok(t) => {
          r.read_unknown(bytes, t)?;
        }
        Err(e) => return Err(e),
      }
    }
    Ok(msg)
  }
}

#[derive(Debug, Default, PartialEq, Clone)]
pub struct UserInfo<'a> {
  pub face: Option<Cow<'a, str>>,
}

impl<'a> MessageRead<'a> for UserInfo<'a> {
  fn from_reader(r: &mut BytesReader, bytes: &'a [u8]) -> Result<Self> {
    let mut msg = Self::default();
    while !r.is_eof() {
      match r.next_tag(bytes) {
        Ok(34) => msg.face = Some(r.read_string(bytes).map(Cow::Borrowed)?),
        Ok(t) => {
          r.read_unknown(bytes, t)?;
        }
        Err(e) => return Err(e),
      }
    }
    Ok(msg)
  }
}
