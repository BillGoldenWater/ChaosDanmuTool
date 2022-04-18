/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function encodeString(str: string): DataView {
  const encoder = new TextEncoder();
  return new DataView(encoder.encode(str).buffer);
}

export function decodeString(data: DataView): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(data.buffer);
}
