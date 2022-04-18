/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TBiliBiliPackParseError = {
  cmd: "bilibiliPackParseError";
  message: string;
  packet: unknown; // TODO
};

export function getBiliBiliPackParseErrorCommand(
  message: string,
  packet: unknown // TODO
): TBiliBiliPackParseError {
  return {
    cmd: "bilibiliPackParseError",
    message: message,
    packet: packet,
  };
}
