/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {getString as httpGet} from "../HttpUtils";
import {TRoomInitResponse} from "../../type/bilibili/request/TRoomInitResponse";

export class RoomInitGetter {
  static async get(roomid: number): Promise<TRoomInitResponse> {
    return JSON.parse(
      await httpGet(
        `https://api.live.bilibili.com/room/v1/Room/room_init?id=${roomid}`
      )
    );
  }

  static async getId(roomid: number): Promise<number> {
    const res = await this.get(roomid)
    if (res.code == 0) return res.data.room_id
    return roomid
  }
}
