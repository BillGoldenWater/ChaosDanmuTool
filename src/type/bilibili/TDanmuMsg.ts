/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliDanmuContent } from "./TBiliBiliDanmuContent";
import { TEmojiData } from "./TEmojiData";
import { parseMedalInfo, TMedalInfo } from "./userinfo/TMedalInfo";
import { TMedal } from "./userinfo/TMedal";
import { getUserUL, TUserLevel } from "./userinfo/TUserLevel";

export type TDanmuMsg = {
  cmd: "DANMU_MSG";
  data: {
    fontsize: number;
    color: number;
    timestamp: number;
    emojiData: TEmojiData;

    content: string;

    uid: number;
    uName: string;
    isAdmin: number;
    isVip: number;
    isSVip: number;

    medalInfo: TMedalInfo;

    userUL: number;

    userTitle: string;
    userTitle1: string;

    isHistory: undefined | boolean;
    count: number;
  };
};

export function parseDanmuMsg(data: TBiliBiliDanmuContent): TDanmuMsg {
  if (data.data) {
    return <TDanmuMsg>data;
  }

  const danmuMsg: TDanmuMsg = <TDanmuMsg>{ data: {} };
  const danmuMsgRaw: unknown[] = <unknown[]>data.info;

  danmuMsg.cmd = "DANMU_MSG";

  const danmuMeta: unknown[] = <unknown[]>danmuMsgRaw[0];
  if (danmuMeta) {
    danmuMsg.data.fontsize = <number>danmuMeta[2];
    danmuMsg.data.color = <number>danmuMeta[3];
    danmuMsg.data.timestamp = <number>danmuMeta[4];
    danmuMsg.data.emojiData = <TEmojiData>danmuMeta[13];
  }

  danmuMsg.data.content = <string>danmuMsgRaw[1];

  const userData: unknown[] = <unknown[]>danmuMsgRaw[2];
  if (userData) {
    danmuMsg.data.uid = <number>userData[0];
    danmuMsg.data.uName = <string>userData[1];
    danmuMsg.data.isAdmin = <number>userData[2];
    danmuMsg.data.isVip = <number>userData[3];
    danmuMsg.data.isSVip = <number>userData[4];
  }

  const medalInfo: TMedal = <TMedal>danmuMsgRaw[3];
  danmuMsg.data.medalInfo = parseMedalInfo(medalInfo);

  const levelInfo: TUserLevel = <TUserLevel>danmuMsgRaw[4];
  danmuMsg.data.userUL = getUserUL(levelInfo);

  const titleInfo: unknown[] = <unknown[]>danmuMsgRaw[5];
  if (titleInfo && titleInfo.length > 0) {
    danmuMsg.data.userTitle = <string>titleInfo[0];
    danmuMsg.data.userTitle1 = <string>titleInfo[1];
  }

  danmuMsg.data.count = 1;

  return danmuMsg;
}
