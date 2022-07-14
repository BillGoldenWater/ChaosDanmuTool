/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use bytes::{Buf, BufMut, BytesMut};

use crate::libs::network::danmu_receiver::data_type::DataType;
use crate::libs::network::danmu_receiver::op_code::OpCode;
use crate::libs::utils::brotli_utils::brotli_decompress;
use crate::libs::utils::mut_bytes_utils::get_bytes;
use crate::lprintln;

#[derive(Debug)]
pub struct Packet {
  pub data_type: DataType,
  pub op_code: OpCode,
  pub sequence_id: u32,
  pub body: BytesMut,
}

impl Packet {
  pub fn new(body: BytesMut, data_type: DataType, op_code: OpCode) -> Packet {
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
    result.put_u16(Self::get_header_length());
    result.put_u16(self.data_type as u16);
    result.put_u32(self.op_code as u32);
    result.put_u32(self.sequence_id as u32);

    result.put_slice(self.body.to_vec().as_slice());

    result
  }

  pub fn get_packet_length(&self) -> u32 {
    (self.body.len() as u32) + (Self::get_header_length() as u32)
  }

  pub fn get_header_length() -> u16 {
    4 + 2 + 2 + 4 + 4
  }

  pub fn from_bytes(data: &mut BytesMut) -> Vec<Packet> {
    let packet_len = data.get_u32();
    let header_len = data.get_u16();
    let data_type = data.get_u16();
    let op_code = data.get_u32();
    let sequence_id = data.get_u32();
    let body_len = packet_len - (header_len as u32);

    match DataType::from_u16(data_type) {
      DataType::CompressedBrotli => { // brotli
        let body = get_bytes(data, body_len as usize);

        let decompress_result = brotli_decompress(&body.to_vec());
        if decompress_result.is_err() {
          lprintln!("failed to decompress");
          return vec![];
        }
        let decompressed = decompress_result.unwrap();

        Self::from_bytes(&mut BytesMut::from(decompressed.as_slice()))
      }
      DataType::CompressedZlib => {
        // zlib
        lprintln!("unsupported compress format");
        vec![]
      }
      _ => { // other
        let body = get_bytes(data, body_len as usize);

        let mut result = vec![Packet {
          data_type: DataType::from_u16(data_type),
          op_code: OpCode::from_u32(op_code),
          sequence_id,
          body,
        }];

        if data.capacity() > 0 {
          result.append(&mut Self::from_bytes(data))
        }

        result
      }
    }
  }

  pub fn join(info: JoinPacketInfo) -> Packet {
    Self::new(
      BytesMut::from(serde_json::to_string(&info).unwrap().as_str()),
      DataType::HeartbeatOrJoin,
      OpCode::Join,
    )
  }

  pub fn heartbeat() -> Packet {
    Self::new(
      BytesMut::new(),
      DataType::HeartbeatOrJoin,
      OpCode::Heartbeat,
    )
  }
}

#[derive(Debug, serde::Serialize)]
pub struct JoinPacketInfo {
  pub roomid: i32,
  pub protover: i32,
  pub platform: String,
  pub key: String,
}

