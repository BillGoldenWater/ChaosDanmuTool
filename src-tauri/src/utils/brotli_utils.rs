/*
 * Copyright 2021-2023 Golden_Water
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

pub fn brotli_compress<D: AsRef<[u8]>>(data: &D) -> Result<Vec<u8>> {
  let mut compressed = vec![];

  brotli::BrotliCompress(
    &mut Cursor::new(data),
    &mut Cursor::new(&mut compressed),
    &BROTLI_PARAMS,
  )?;

  Ok(compressed)
}

pub fn brotli_decompress<D: AsRef<[u8]>>(data: &D) -> Result<Vec<u8>> {
  let mut decompressed = vec![];

  brotli::BrotliDecompress(&mut Cursor::new(data), &mut Cursor::new(&mut decompressed))?;

  Ok(decompressed)
}

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
  #[error("failed to compress: {0:?}")]
  IoError(#[from] std::io::Error)
}
