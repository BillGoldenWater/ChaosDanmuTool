/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Packet } from "../../../../../main/network/client/danmuReceiver/Packet";

export type TBiliBiliPackParseError = {
  cmd: "bilibiliPackParseError";
  message: string;
  packet: Packet;
};

export function getBiliBiliPackParseErrorCommand(
  message: string,
  packet: Packet
): TBiliBiliPackParseError {
  return {
    cmd: "bilibiliPackParseError",
    message: message,
    packet: packet,
  };
}
