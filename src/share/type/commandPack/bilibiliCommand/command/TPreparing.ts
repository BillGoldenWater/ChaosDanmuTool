/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TPreparing = {
  cmd: "PREPARING";
  roomid: string;
};

export function getPreparingCommand(roomid: number): TPreparing {
  return {
    cmd: "PREPARING",
    roomid: roomid.toString(),
  };
}
