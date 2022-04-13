/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TRoomBlockMsg = {
  cmd: "ROOM_BLOCK_MSG";
  data: {
    dmscore: number;
    operator: number;
    uid: number;
    uname: string;
  };
  uid: string;
  uname: string;
};
