/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {TDanmuMsg} from "./TDanmuMsg";
import {TEmojiData} from "../../../bilibili/TEmojiData";
import {TRawUserLevel} from "../../../bilibili/userinfo/TRawUserLevel";
import {getUserUL} from "../../../bilibili/userinfo/TUserLevel";
import {TRawMedal} from "../../../bilibili/userinfo/TRawMedal";
import {
  parseRawMedal,
  TMedalInfo,
} from "../../../bilibili/userinfo/TMedalInfo";

export type TDanmuType = 0 | 1

export type TParsedDanmuMsg = {
  cmd: "parsedDanmuMsg";

  fontsize: number;
  color: number;
  /**
   * ms
   * */
  timestamp: number;
  danmu_type: TDanmuType;
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

export enum danmuType {
  normal = 0,
  emoji = 1,
}

export function parseDanmuMsg(danmuMsg: TDanmuMsg): TParsedDanmuMsg {
  const result: TParsedDanmuMsg = <TParsedDanmuMsg>{cmd: "parsedDanmuMsg"};
  const danmuMsgRaw: unknown[] = danmuMsg.info;

  const danmuMeta: unknown[] = <unknown[]>danmuMsgRaw[0];
  if (danmuMeta) {
    result.fontsize = <number>danmuMeta[2];
    result.color = <number>danmuMeta[3];
    result.timestamp = <number>danmuMeta[4];
    result.danmu_type = <TDanmuType>danmuMeta[12];
    result.emojiData = <TEmojiData>danmuMeta[13];
  }

  result.content = <string>danmuMsgRaw[1];

  const userData: unknown[] = <unknown[]>danmuMsgRaw[2];
  if (userData) {
    result.uid = <number>userData[0];
    result.uName = <string>userData[1];
    result.isAdmin = <number>userData[2];
    result.isVip = <number>userData[3];
    result.isSVip = <number>userData[4];
  }

  const medalInfo: TRawMedal = <TRawMedal>danmuMsgRaw[3];
  result.medalInfo = parseRawMedal(medalInfo);

  const levelInfo: TRawUserLevel = <TRawUserLevel>danmuMsgRaw[4];
  result.userUL = getUserUL(levelInfo);

  const titleInfo: unknown[] = <unknown[]>danmuMsgRaw[5];
  if (titleInfo && titleInfo.length > 0) {
    result.userTitle = <string>titleInfo[0];
    result.userTitle1 = <string>titleInfo[1];
  }

  result.count = 1;

  return result;
}

export function getParsedDanmuMsgCommand(
  content: string,
  timestamp = new Date().getTime(),
  emojiData: TEmojiData = null,
  uid = 1,
  uName = "[CDT]",
  isAdmin = 0,
  isVip = 0,
  isSVip = 0,
  danmu_type: TDanmuType = emojiData ? 1 : 0,
  medalInfo: TMedalInfo = null,
  userUL = 0,
  userTitle = "",
  userTitle1 = "",
  isHistory = false
): TParsedDanmuMsg {
  return {
    cmd: "parsedDanmuMsg",

    fontsize: 0,
    color: 0,
    timestamp: timestamp,
    danmu_type: danmu_type,
    emojiData: emojiData,

    content: content,

    uid: uid,
    uName: uName,
    isAdmin: isAdmin,
    isVip: isVip,
    isSVip: isSVip,

    medalInfo: medalInfo,

    userUL: userUL,

    userTitle: userTitle,
    userTitle1: userTitle1,

    isHistory: isHistory,
    count: 1,
  };
}
