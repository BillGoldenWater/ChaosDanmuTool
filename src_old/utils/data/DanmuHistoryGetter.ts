/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import https from "https";
import { TDanmuHistoryResponse } from "../../type/bilibili/request/danmuhistory/TDanmuHistoryResponse";
import { TBiliBiliDanmuContent } from "../../type/bilibili/TBiliBiliDanmuContent";
import { TDanmuMsg } from "../../type/bilibili/TDanmuMsg";
import { parseMedalInfo } from "../../type/bilibili/userinfo/TMedalInfo";
import { getUserUL } from "../../type/bilibili/userinfo/TUserLevel";

export class DanmuHistoryGetter {
  historyRes: TDanmuHistoryResponse;
  historyResStr: string;

  get(
    roomid: number,
    callback: (history: TBiliBiliDanmuContent[]) => void
  ): void {
    this.historyResStr = "";
    https
      .get(
        `https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=${roomid.toString(
          10
        )}`,
        {},
        (res) => {
          res.on("data", (data) => {
            this.historyResStr += data.toString();
          });
          res.on("end", () => {
            this.historyRes = JSON.parse(this.historyResStr);
            try {
              callback(
                this.historyRes.data.room.map((value) => {
                  const msg: TDanmuMsg = {
                    cmd: "DANMU_MSG",
                    data: {
                      fontsize: 0,
                      color: 0,
                      timestamp: value.check_info.ts * 1000,
                      emojiData:
                        value.emoticon && value.emoticon.url
                          ? value.emoticon
                          : null,

                      content: value.text,

                      uid: value.uid,
                      uName: value.nickname,
                      isAdmin: value.isadmin,
                      isVip: value.vip,
                      isSVip: value.svip,

                      medalInfo: parseMedalInfo(value.medal),

                      userUL: getUserUL(value.user_level),

                      userTitle:
                        value.title && value.title.length > 0
                          ? value.title[0]
                          : "",
                      userTitle1: "",

                      isHistory: true,
                      count: 1,
                    },
                  };

                  return <TDanmuMsg>msg;
                })
              );
            } catch (e) {
              DanmuHistoryGetter.onException(callback);
            }
          });
        }
      )
      .on("error", (event) => {
        DanmuHistoryGetter.onException(callback, event.message);
      });
  }

  private static onException(
    callback: (history: TBiliBiliDanmuContent[]) => void,
    message?: string
  ) {
    callback([
      {
        cmd: "DANMU_MSG",
        data: {
          fontsize: 0,
          color: 0,
          timestamp: new Date().getTime(),
          emojiData: null,

          content: "弹幕历史记录获取失败" + (message ? " " + message : ""),

          uid: 0,
          uName: "[CDT]",
          isAdmin: 1,
          isVip: 0,
          isSVip: 0,

          medalInfo: null,

          userUL: 0,

          userTitle: "",
          userTitle1: "",

          isHistory: true,
          count: 1,
        },
      },
    ]);
  }
}
