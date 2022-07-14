/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use bytes::{Buf, BufMut, BytesMut};

pub fn get_bytes(data: &mut BytesMut, len: usize) -> BytesMut {
  let mut result = BytesMut::with_capacity(len);

  for _ in 0..len {
    result.put_u8(data.get_u8())
  }

  result
}
