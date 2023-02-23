/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use crate::b_get;
use bytes::{BufMut, BytesMut};
use log::info;

use crate::network::danmu_receiver::data_type::DataType;
use crate::network::danmu_receiver::op_code::OpCode;
use crate::utils::brotli_utils::brotli_decompress;

#[derive(Debug)]
pub struct Packet {
  pub data_type: DataType,
  pub op_code: OpCode,
  pub sequence_id: u32,
  pub body: Vec<u8>,
}

impl Packet {
  const HEAD_SIZE: u16 = 4 + 2 + 2 + 4 + 4;

  pub fn new(body: Vec<u8>, data_type: DataType, op_code: OpCode) -> Packet {
    Packet {
      data_type,
      op_code,
      sequence_id: 1,
      body,
    }
  }

  pub fn pack(&self) -> BytesMut {
    let mut result = BytesMut::with_capacity(self.get_packet_length() as usize);

    result.put_u32(self.get_packet_length());
    result.put_u16(Self::HEAD_SIZE);
    result.put_u16(self.data_type as u16);
    result.put_u32(self.op_code as u32);
    result.put_u32(self.sequence_id);

    result.put_slice(self.body.as_ref());

    result
  }

  pub fn get_packet_length(&self) -> u32 {
    (self.body.len() as u32) + (Self::HEAD_SIZE as u32)
  }

  pub fn parse_bytes<D: AsRef<[u8]>>(data: &D) -> Vec<Packet> {
    if data.as_ref().len() < Self::HEAD_SIZE as usize {
      return vec![];
    }

    let (head, data) = data.as_ref().split_at(Self::HEAD_SIZE as usize);

    let mut offset = 0;
    let packet_len = b_get!(@u32, head, offset);
    let header_len = b_get!(@u16, head, offset);
    let data_type = b_get!(@u16, head, offset);
    let op_code = b_get!(@u32, head, offset);
    let sequence_id = b_get!(@u32, head, offset);

    let body_len = packet_len - (header_len as u32);
    let (body, extra) = data.split_at(body_len as usize);

    match DataType::from_u16(data_type) {
      DataType::CompressedBrotli => {
        let decompress_result = brotli_decompress(&body);
        if decompress_result.is_err() {
          info!("failed to decompress");
          return vec![];
        }
        let decompressed = decompress_result.unwrap();

        Self::parse_bytes(&decompressed.as_slice())
      }
      DataType::CompressedZlib => {
        info!("unsupported compress format");
        vec![]
      }
      _ => {
        // normal
        let mut result = vec![Packet {
          data_type: DataType::from_u16(data_type),
          op_code: OpCode::from_u32(op_code),
          sequence_id,
          body: body.to_vec(),
        }];

        if !extra.is_empty() {
          result.append(&mut Self::parse_bytes(&extra))
        }

        result
      }
    }
  }

  pub fn join(info: JoinPacketInfo) -> Packet {
    Self::new(
      serde_json::to_string(&info).unwrap().into_bytes(),
      DataType::HeartbeatOrJoin,
      OpCode::Join,
    )
  }

  pub fn heartbeat() -> Packet {
    Self::new(vec![], DataType::HeartbeatOrJoin, OpCode::Heartbeat)
  }
}

#[derive(Debug, serde::Serialize)]
pub struct JoinPacketInfo {
  pub roomid: u32,
  pub protover: i32,
  pub platform: String,
  pub key: String,
}
