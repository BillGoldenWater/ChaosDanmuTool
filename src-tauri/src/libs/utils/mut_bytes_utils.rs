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

pub fn bytes_to_hex(data: &BytesMut) -> String {
  let data: &[u8] = data.as_ref();
  let mut result: String = "".to_string();

  for byte in data {
    let byte = byte_to_hex(byte.clone());
    result.push(byte[0]);
    result.push(byte[1]);
  }

  result
}

static HEX_CHARS: [char; 16] =
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

pub fn byte_to_hex(byte: u8) -> [char; 2] {
  [HEX_CHARS[(byte >> 4) as usize], HEX_CHARS[(byte & 0xF) as usize]]
}
