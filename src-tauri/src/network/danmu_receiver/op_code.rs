/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum OpCode {
  Heartbeat = 2,
  HeartbeatResponse = 3,
  Message = 5,
  Join = 7,
  JoinResponse = 8,
  Other = 10086,
}

impl OpCode {
  pub fn from_u32(value: u32) -> OpCode {
    match value {
      2 => OpCode::Heartbeat,
      3 => OpCode::HeartbeatResponse,
      5 => OpCode::Message,
      7 => OpCode::Join,
      8 => OpCode::JoinResponse,
      _ => OpCode::Other,
    }
  }
}
