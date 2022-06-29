/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TRoomRealTimeMessageUpdate = {
  cmd: "ROOM_REAL_TIME_MESSAGE_UPDATE";
  data: {
    roomid: number;
    fans: number;
    red_notice: number;
    fans_club: number;
  };
};

export function getRoomRealTimeMessageUpdateCommand(
  fans = 0,
  fans_club = 0,
  roomid = 0
): TRoomRealTimeMessageUpdate {
  return {
    cmd: "ROOM_REAL_TIME_MESSAGE_UPDATE",
    data: { fans: fans, fans_club: fans_club, red_notice: 0, roomid: roomid },
  };
}
