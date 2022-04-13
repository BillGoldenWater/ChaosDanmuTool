/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TMedal } from "../userinfo/TMedal";
import { TUserLevel } from "../userinfo/TUserLevel";
import { TEmojiData } from "../TEmojiData";

export type TDanmuHistorySingle = {
  text: string;
  dm_type: number;
  uid: number;
  nickname: string;
  uname_color: string;
  timeline: string;
  isadmin: number;
  vip: number;
  svip: number;
  medal: TMedal;
  title: string[];
  user_level: TUserLevel;
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
