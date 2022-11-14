/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::io::Cursor;

use brotli::enc::backward_references::BrotliEncoderMode;
use brotli::enc::BrotliEncoderParams;

lazy_static! {
  static ref BROTLI_PARAMS: BrotliEncoderParams = {
    BrotliEncoderParams {
      quality: 6,
      mode: BrotliEncoderMode::BROTLI_MODE_TEXT,
      ..Default::default()
    }
  };
}

pub fn brotli_compress(data: &Vec<u8>) -> Result<Vec<u8>> {
  let mut compressed = vec![];

  brotli::BrotliCompress(
    &mut Cursor::new(data),
    &mut Cursor::new(&mut compressed),
    &BROTLI_PARAMS,
  )?;

  Ok(compressed)
}

pub fn brotli_compress_str(data: String) -> Result<String> {
  Ok(base64::encode(brotli_compress(&data.as_bytes().to_vec())?))
}

pub fn brotli_decompress(data: &Vec<u8>) -> Result<Vec<u8>> {
  let mut decompressed = vec![];

  brotli::BrotliDecompress(&mut Cursor::new(data), &mut Cursor::new(&mut decompressed))?;

  Ok(decompressed)
}

pub fn brotli_decompress_str(base64: String) -> Result<String> {
  let decoded = base64::decode(base64)?;
  Ok(String::from_utf8_lossy(&*brotli_decompress(&decoded)?).to_string())
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to compress: {0:?}")]
  IoError(#[from] std::io::Error),
  #[error("failed to decode base64 string: {0:?}")]
  Base64DecodeError(#[from] base64::DecodeError),
}
