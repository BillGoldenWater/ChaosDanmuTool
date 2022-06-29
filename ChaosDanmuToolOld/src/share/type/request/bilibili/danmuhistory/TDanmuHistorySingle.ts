/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TRawMedal } from "../../../bilibili/userinfo/TRawMedal";
import { TRawUserLevel } from "../../../bilibili/userinfo/TRawUserLevel";
import { TEmojiData } from "../../../bilibili/TEmojiData";
import { TDanmuType } from "../../../commandPack/bilibiliCommand/command/TParsedDanmuMsg";

export type TDanmuHistorySingle = {
  text: string;
  dm_type: TDanmuType;
  uid: number;
  nickname: string;
  uname_color: string;
  timeline: string;
  isadmin: number;
  vip: number;
  svip: number;
  medal: TRawMedal;
  title: string[];
  user_level: TRawUserLevel;
  rank: number;
  teamid: number;
  rnd: string;
  user_title: string;
  guard_level: number;
  bubble: number;
  bubble_color: string;
  lpl: number;
  check_info: {
    ts: number;
    ct: string;
  };
  voice_dm_info: {
    voice_url: string;
    file_format: string;
    text: string;
    file_duration: number;
    file_id: string;
  };
  emoticon: TEmojiData;
};
