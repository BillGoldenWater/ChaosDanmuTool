/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getString } from "../../utils/HttpUtils";
import { TDanmuServerInfoResponse } from "../../../share/type/request/bilibili/danmuServerInfoResponse/TDanmuServerInfoResponse";
import { TDanmuServerTokenAndUrl } from "../../../share/type/request/bilibili/danmuServerInfoResponse/TDanmuServerTokenAndUrl";

export class DanmuServerInfoGetter {
  static async get(actualRoomid: number): Promise<TDanmuServerInfoResponse> {
    if (actualRoomid == null || isNaN(actualRoomid)) actualRoomid = 0;
    let url =
      "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo";
    url += `?id=${actualRoomid.toString(10)}`;
    return JSON.parse(await getString(url));
  }

  static async getTokenAndAUrl(
    actualRoomid: number
  ): Promise<TDanmuServerTokenAndUrl> {
    const data = (await this.get(actualRoomid)).data;

    if (data.host_list.length > 0) {
      const host = data.host_list[0];
      return {
        token: data.token,
        url: `wss://${host.host}:${host.wss_port}/sub`,
      };
    } else {
      return {
        token: data.token,
        url: `wss://broadcastlv.chat.bilibili.com/sub`,
      };
    }
  }
}
