/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum DataType {
  Json = 0,
  HeartbeatOrJoin = 1,
  CompressedZlib = 2,
  CompressedBrotli = 3,
  Other = 10086,
}

impl DataType {
  pub fn from_u16(value: u16) -> DataType {
    match value {
      0 => DataType::Json,
      1 => DataType::HeartbeatOrJoin,
      2 => DataType::CompressedZlib,
      3 => DataType::CompressedBrotli,
      _ => DataType::Other,
    }
  }
}
