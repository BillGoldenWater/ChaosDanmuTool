/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::cmp::max;
use std::io::Cursor;

use bytes::{Buf, BufMut, BytesMut};

use crate::libs::network::receiver::data_type::DataType;
use crate::libs::network::receiver::op_code::OpCode;

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

  pub fn from_bytes(bytes: Vec<u8>) -> Vec<Packet> {
    let mut data = BytesMut::from(bytes.as_slice());

    let packet_len = data.get_u32();
    let header_len = data.get_u16();
    let data_type = data.get_u16();
    let op_code = data.get_u32();
    let sequence_id = data.get_u32();
    let body_len = packet_len - (header_len as u32);

    match DataType::from_u16(data_type) {
      DataType::CompressedBrotli => { // brotli
        let body = Self::get_body(&mut data, body_len);

        let mut decompressed = vec![];
        let result = brotli_decompressor::BrotliDecompress(
          &mut Cursor::new(body.to_vec()),
          &mut Cursor::new(&mut decompressed),
        );
        if result.is_err() {
          println!("failed to decompress");
          return vec![];
        }

        Self::from_bytes(decompressed)
      }
      DataType::CompressedZlib => { // zlib
        println!("unsupported compress format");
        vec![]
      }
      _ => { // other
        let body = Self::get_body(&mut data, body_len);

        let mut result = vec![Packet {
          data_type: DataType::from_u16(data_type),
          op_code: OpCode::from_u32(op_code),
          sequence_id,
          body,
        }];

        if data.capacity() > packet_len as usize {
          result.append(&mut Self::from_bytes(
            data.to_vec()
              [(packet_len as usize)..max(data.capacity() - 1, packet_len as usize)]
              .to_vec()
          ))
        }

        result
      }
    }
  }

  fn get_body(data: &mut BytesMut, body_len: u32) -> BytesMut {
    let mut body = BytesMut::with_capacity(body_len as usize);

    for _ in 0..body_len {
      body.put_u8(data.get_u8())
    }

    body
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

