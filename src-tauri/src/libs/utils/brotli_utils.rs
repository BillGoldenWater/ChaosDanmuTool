/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::io::Cursor;

use brotli::enc::BrotliEncoderParams;

pub fn brotli_compress(data: &Vec<u8>) -> Result<Vec<u8>, std::io::Error> {
  let mut compressed = vec![];

  let mut encoder_params = BrotliEncoderParams::default();
  encoder_params.quality = 9;

  let _ = brotli::BrotliCompress(
    &mut Cursor::new(data),
    &mut Cursor::new(&mut compressed),
    &encoder_params,
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
