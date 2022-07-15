/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::io::Cursor;

use brotli::enc::backward_references::BrotliEncoderMode;
use brotli::enc::BrotliEncoderParams;

lazy_static! {
  static ref BROTLI_PARAMS: BrotliEncoderParams = {
    let mut encoder_params = BrotliEncoderParams::default();
    encoder_params.quality = 6;
    encoder_params.mode = BrotliEncoderMode::BROTLI_MODE_TEXT;
    encoder_params
  };
}

pub fn brotli_compress(data: &Vec<u8>) -> Result<Vec<u8>, std::io::Error> {
  let mut compressed = vec![];

  let _ = brotli::BrotliCompress(
    &mut Cursor::new(data),
    &mut Cursor::new(&mut compressed),
    &BROTLI_PARAMS,
  )?;

  Ok(compressed)
}

pub fn brotli_decompress(data: &Vec<u8>) -> Result<Vec<u8>, std::io::Error> {
  let mut decompressed = vec![];
  
  let _ = brotli::BrotliDecompress(
    &mut Cursor::new(data),
    &mut Cursor::new(&mut decompressed),
  )?;

  Ok(decompressed)
}
