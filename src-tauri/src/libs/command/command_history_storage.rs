/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::io::ErrorKind;
use std::path::PathBuf;

use bytes::{Buf, BytesMut};
use chrono::{DateTime, Utc};
use tokio::fs::OpenOptions;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::elprintln;
use crate::libs::utils::brotli_utils::{brotli_compress, brotli_decompress};
use crate::libs::utils::mut_bytes_utils::get_bytes;

static MAX_RECORD_PER_FILE: u64 = 500;
static RECORD_FILE_EXT: &str = ".cdtch";

pub struct CommandHistoryStorage {
  data_dir: PathBuf,
  max_record_per_file: u64,
  index: u64,
}

impl CommandHistoryStorage {
  pub fn new(data_dir: PathBuf) -> CommandHistoryStorage {
    let uuid = uuid::Uuid::new_v4().to_string();
    let ts = Utc::now();


    CommandHistoryStorage {
      data_dir: data_dir.join(gen_data_dir_name(&ts, &uuid)),
      max_record_per_file: MAX_RECORD_PER_FILE,
      index: 0,
    }
  }

  pub fn from_folder(_folder: PathBuf) -> CommandHistoryStorage {
    unimplemented!()
  }

  pub async fn write(&mut self, data: String) {
    if let Err(err) = std::fs::create_dir_all(self.data_dir.as_path()) {
      elprintln!("unable to create data dir {:?}", err);
      return;
    }

    // region open
    let open_result = OpenOptions::new()
      .create(true)
      .append(true)
      .open(self.get_file_path(self.index).as_path())
      .await;

    if let Err(err) = open_result {
      elprintln!("unable to open history file for write, {:?}", err);
      return;
    }
    // endregion

    let mut file = open_result.unwrap();
    let data = data.as_bytes();

    // region compress
    let compress_result = brotli_compress(&data.to_vec());

    if let Err(err) = compress_result {
      elprintln!("unable to compress data, {:?}",err);
      return;
    }

    let compressed = compress_result.unwrap();
    // endregion

    // region write
    let write_result = file.write_u128(compressed.len() as u128).await;
    if let Err(err) = write_result {
      elprintln!("unable to write data length, {:?}",err);
      return;
    }
    let write_result = file.write(compressed.as_slice()).await;
    if let Err(err) = write_result {
      elprintln!("unable to write data, {:?}",err);
      return;
    }
    // endregion

    self.index += 1;
  }

  pub async fn read(&self, start_index: u64, end_index: u64) -> Vec<String> {
    // region read
    let start_file_index = self.get_file_id(start_index) * self.max_record_per_file;
    let mut compressed_data: Vec<Vec<u8>> = vec![];

    for i in (start_file_index..end_index).step_by(self.max_record_per_file as usize) {
      let file_info = self.get_file_path(i);

      // region open
      let open_result = OpenOptions::new()
        .read(true)
        .open(file_info.as_path())
        .await;

      if let Err(err) = open_result {
        match err.kind() {
          ErrorKind::NotFound => {
            break;
          }
          _ => {
            elprintln!("unable to open history file for read");
            break;
          }
        };
      }

      let mut file = open_result.unwrap();
      // endregion

      // region read
      let mut data = vec![];
      let read_result = file.read_to_end(&mut data).await;

      if let Err(err) = read_result {
        elprintln!("unable to read history file {:?}", err);
        break;
      }

      for item in self.parse_file(data) {
        compressed_data.push(item);
      }
      // endregion
    }
    // endregion

    // region decompress
    let mut result = vec![];
    for i in (start_index - start_file_index)..(end_index - start_file_index) {
      if let Some(data) = compressed_data.get(i as usize) {
        if let Ok(data) = brotli_decompress(data) {
          if let Ok(str) = std::str::from_utf8(data.as_slice()) {
            result.push(str.to_string());
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
    // endregion
    result
  }

  fn parse_file(&self, data: Vec<u8>) -> Vec<Vec<u8>> {
    let mut data = BytesMut::from(data.as_slice());
    let mut result = vec![];

    loop {
      if !data.has_remaining() { break; }
      let length = data.get_u128();
      if length > data.remaining() as u128 { break; }

      result.push(get_bytes(&mut data, length as usize).to_vec());
    }

    result
  }

  fn get_file_id(&self, index: u64) -> u64 {
    index / self.max_record_per_file
  }

  fn get_file_path(&self, index: u64) -> PathBuf {
    self.data_dir.join(
      format!(
        "{}{}",
        self.get_file_id(index),
        RECORD_FILE_EXT
      )
    )
  }
}

fn gen_data_dir_name(ts: &DateTime<Utc>, uuid: &String) -> String {
  format!(
    "{}_{}_{}",
    ts.format("%Y-%m-%d-%H-%M-%S").to_string(),
    uuid,
    MAX_RECORD_PER_FILE
  )
}
