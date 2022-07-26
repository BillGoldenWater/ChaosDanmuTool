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

use crate::error;
use crate::libs::utils::brotli_utils::{brotli_compress, brotli_decompress};
use crate::libs::utils::fs_utils::get_dir_children_names;
use crate::libs::utils::mut_bytes_utils::get_bytes;

static MAX_RECORD_PER_FILE: u64 = 1000;
static RECORD_FILE_EXT: &str = ".cdtch";

pub struct CommandHistoryStorage {
  data_dir: PathBuf,
  max_record_per_file: u64,
  index: u64,

  readonly: bool,
}

impl CommandHistoryStorage {
  pub fn new(data_dir: PathBuf) -> CommandHistoryStorage {
    let uuid = uuid::Uuid::new_v4().to_string();
    let ts = Utc::now();


    CommandHistoryStorage {
      data_dir: data_dir.join(gen_data_dir_name(&ts, &uuid)),
      max_record_per_file: MAX_RECORD_PER_FILE,
      index: 0,

      readonly: false,
    }
  }

  pub async fn from_folder(folder: PathBuf) -> CommandHistoryStorage {
    let info: Vec<&str> = folder.file_name().unwrap().to_str().unwrap()
      .split("_")
      .collect();

    let mut this = CommandHistoryStorage {
      data_dir: folder.clone(),
      max_record_per_file: info[1].parse().unwrap(),
      index: 0,

      readonly: true,
    };
    this.init_from_folder().await;
    this
  }

  async fn init_from_folder(&mut self) {
    // region get latest file id
    let file_names_result = get_dir_children_names(&self.data_dir, true);
    if let Err(err) = &file_names_result {
      error!("unable to read history storage info {:?}",err);
      return;
    }

    let file_names = file_names_result.unwrap();

    let file_num = file_names.len();
    if file_num == 0 {
      self.readonly = false;
      return;
    }
    let file_id = (file_num as u64) - 1;
    let last_file_item_index = file_id * self.max_record_per_file;
    // endregion

    // region get the latest file's record number
    let read_result = self.read_file(last_file_item_index).await;
    if let Err(err) = read_result {
      eprintln!("unable to read history file for get item number {:?}", err);
      return;
    }

    let index = read_result.unwrap().len() as u64;
    // endregion

    self.index = last_file_item_index + index;
    self.readonly = false;
  }

  pub async fn write(&mut self, data: String) {
    if self.readonly {
      error!("IllegalOperation: write to readonly storage");
    }

    if let Err(err) = std::fs::create_dir_all(self.data_dir.as_path()) {
      error!("unable to create data dir {:?}", err);
      return;
    }

    // region open
    let open_result = OpenOptions::new()
      .create(true)
      .append(true)
      .open(self.get_file_path(self.index).as_path())
      .await;

    if let Err(err) = open_result {
      error!("unable to open history file for write, {:?}", err);
      return;
    }
    // endregion

    let mut file = open_result.unwrap();
    let data = data.as_bytes();

    // region compress
    let compress_result = brotli_compress(&data.to_vec());

    if let Err(err) = compress_result {
      error!("unable to compress data, {:?}",err);
      return;
    }

    let compressed = compress_result.unwrap();
    // endregion

    // region write
    let write_result = file.write_u64(compressed.len() as u64).await;
    if let Err(err) = write_result {
      error!("unable to write data length, {:?}",err);
      return;
    }
    let write_result = file.write(compressed.as_slice()).await;
    if let Err(err) = write_result {
      error!("unable to write data, {:?}",err);
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
      if let Ok(mut data) = self.read_file(i).await {
        compressed_data.append(&mut data);
      } else {
        break;
      }
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

  async fn read_file(&self, index: u64) -> Result<Vec<Vec<u8>>, ()> {
    let file_info = self.get_file_path(index);

    // region open
    let open_result = OpenOptions::new()
      .read(true)
      .open(file_info.as_path())
      .await;

    if let Err(err) = open_result {
      match err.kind() {
        ErrorKind::NotFound => {}
        _ => {
          error!("unable to open history file for read {:?}", err);
        }
      };
      return Err(());
    }

    let mut file = open_result.unwrap();
    // endregion

    // region read
    let mut data = vec![];
    let read_result = file.read_to_end(&mut data).await;

    if let Err(err) = read_result {
      error!("unable to read history file {:?}", err);
      return Err(());
    }
    // endregion

    Ok(self.parse_file(data))
  }

  fn parse_file(&self, data: Vec<u8>) -> Vec<Vec<u8>> {
    let mut data = BytesMut::from(data.as_slice());
    let mut result = vec![];

    loop {
      if !data.has_remaining() { break; }
      let length = data.get_u64();
      if length > data.remaining() as u64 { break; }

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

  pub fn len(&self) -> u64 {
    self.index
  }
}

fn gen_data_dir_name(ts: &DateTime<Utc>, uuid: &String) -> String {
  format!(
    "{}_{}_{}",
    ts.format("%Y-%m-%d-%H-%M-%S").to_string(),
    MAX_RECORD_PER_FILE,
    uuid,
  )
}
