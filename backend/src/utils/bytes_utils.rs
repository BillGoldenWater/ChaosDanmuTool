/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

pub fn bytes_to_hex<D: AsRef<[u8]>>(data: &D) -> String {
  let mut result: String = "".to_string();

  for byte in data.as_ref() {
    let byte = byte_to_hex(*byte);
    result.push(byte[0]);
    result.push(byte[1]);
  }

  result
}

static HEX_CHARS: [char; 16] = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
];

pub fn byte_to_hex(byte: u8) -> [char; 2] {
  [
    HEX_CHARS[(byte >> 4) as usize],
    HEX_CHARS[(byte & 0xF) as usize],
  ]
}

#[macro_export]
macro_rules! b_get {
  (@u64, $data:expr $(, $offset:expr)?) => {{
    let result = ($data[$($offset + )? + 0] as u64) << 56
      | ($data[$($offset + )? 1] as u64) << 48
      | ($data[$($offset + )? 2] as u64) << 40
      | ($data[$($offset + )? 3] as u64) << 32
      | ($data[$($offset + )? 4] as u64) << 24
      | ($data[$($offset + )? 5] as u64) << 16
      | ($data[$($offset + )? 6] as u64) << 8
      | $data[$($offset + )? 7] as u64;
    $(
      #[allow(unused_assignments)]
      {
        $offset += 8;
      }
    )?
    result
  }};
  (@u32, $data:expr $(, $offset:expr)?) => {{
    let result = ($data[$($offset + )? 0] as u32) << 24
      | ($data[$($offset + )? 1] as u32) << 16
      | ($data[$($offset + )? 2] as u32) << 8
      | $data[$($offset + )? 3] as u32;
    $(
      #[allow(unused_assignments)]
      {
        $offset += 4;
      }
    )?
    result
  }};
  (@u16, $data:expr $(, $offset:expr)?) => {{
    let result = ($data[$($offset + )? 0] as u16) << 8 | $data[$($offset + )? 1] as u16;
    $(
      #[allow(unused_assignments)]
      {
        $offset += 2;
      }
    )?
    result
  }};
  (@u8, $data:expr $(, $offset:expr)?) => {{
    let result = $data[$($offset + )? 0] as u8;
    $(
      #[allow(unused_assignments)]
      {
        $offset += 1;
      }
    )?
    result
  }};
}
