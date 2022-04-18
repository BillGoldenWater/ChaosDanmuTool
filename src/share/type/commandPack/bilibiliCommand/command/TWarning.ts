/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TWarning = {
  cmd: "WARNING";
  msg: string;
  roomid: number;
};

export function getWarningCommand(msg: string, roomid = 0): TWarning {
  return { cmd: "WARNING", msg: msg, roomid: roomid };
}
