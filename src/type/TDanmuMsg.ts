/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DanmuMessage } from "../utils/command/DanmuMessage";
import { TEmojiData } from "./TEmojiData";
import { parseMedalInfo, TMedalInfo } from "./TMedalInfo";
import { TMedal } from "./TMedal";
import { getUserUL, TUserLevel } from "./TUserLevel";

export type TDanmuMsg = {
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
};

export function parseDanmuMsg(data: DanmuMessage): TDanmuMsg {
  if (data.data) {
    return <TDanmuMsg>data.data;
  }

  const danmuMsg: TDanmuMsg = <TDanmuMsg>{};
  const danmuMsgRaw: unknown[] = <unknown[]>data.info;

  const danmuMeta: unknown[] = <unknown[]>danmuMsgRaw[0];
  if (danmuMeta) {
    danmuMsg.fontsize = <number>danmuMeta[2];
    danmuMsg.color = <number>danmuMeta[3];
    danmuMsg.timestamp = <number>danmuMeta[4];
    danmuMsg.emojiData = <TEmojiData>danmuMeta[13];
  }

  danmuMsg.content = <string>danmuMsgRaw[1];

  const userData: unknown[] = <unknown[]>danmuMsgRaw[2];
  if (userData) {
    danmuMsg.uid = <number>userData[0];
    danmuMsg.uName = <string>userData[1];
    danmuMsg.isAdmin = <number>userData[2];
    danmuMsg.isVip = <number>userData[3];
    danmuMsg.isSVip = <number>userData[4];
  }

  const medalInfo: TMedal = <TMedal>danmuMsgRaw[3];
  danmuMsg.medalInfo = parseMedalInfo(medalInfo);

  const levelInfo: TUserLevel = <TUserLevel>danmuMsgRaw[4];
  danmuMsg.userUL = getUserUL(levelInfo);

  const titleInfo: unknown[] = <unknown[]>danmuMsgRaw[5];
  if (titleInfo && titleInfo.length > 0) {
    danmuMsg.userTitle = <string>titleInfo[0];
    danmuMsg.userTitle1 = <string>titleInfo[1];
  }

  return danmuMsg;
}
