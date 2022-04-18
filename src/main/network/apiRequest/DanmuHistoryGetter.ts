/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuHistoryResponse } from "../../../share/type/bilibili/request/danmuhistory/TDanmuHistoryResponse";
import { getString } from "../../utils/HttpUtils";
import {
  getParsedDanmuMsgCommand,
  TParsedDanmuMsg,
} from "../../../share/type/commandPack/bilibiliCommand/command/TParsedDanmuMsg";
import { parseRawMedal } from "../../../share/type/bilibili/userinfo/TMedalInfo";
import { getUserUL } from "../../../share/type/bilibili/userinfo/TUserLevel";

export class DanmuHistoryGetter {
  static async get(roomid: number): Promise<TDanmuHistoryResponse> {
    const url = `https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=${roomid.toString()}`;
    return JSON.parse(await getString(url));
  }

  static async getDanmuMsgList(roomid: number): Promise<TParsedDanmuMsg[]> {
    let result: TParsedDanmuMsg[] = [];

    try {
      const res = await this.get(roomid);
      result = res.data.room.map((v) => {
        return getParsedDanmuMsgCommand(
          v.text,
          v.check_info.ts * 1000,
          v.emoticon,
          v.uid,
          v.nickname,
          v.isadmin,
          v.vip,
          v.svip,
          v.dm_type,
          parseRawMedal(v.medal),
          getUserUL(v.user_level),
          v.title[0],
          v.title[1],
          true
        );
      });
    } catch (e) {
      result.push(getParsedDanmuMsgCommand("弹幕历史记录获取失败"));
    }

    return result;
  }
}
