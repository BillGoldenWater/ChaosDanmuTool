/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliResponse } from "./TBiliBiliResponse";

export type TMasterInfoResponse = TBiliBiliResponse<{
  info: {
    uid: number;
    uname: string;
    face: string;
    official_verify: {
      type: number;
      desc: string;
    };
    gender: number;
  };
  exp: {
    master_level: {
      level: number;
      color: number;
      current: [number, number];
      next: [number, number];
    };
  };
  follower_num: number;
  room_id: number;
  medal_name: string;
  glory_count: number;
  pendant: string;
  link_group_num: number;
  room_news: {
    content: string;
    ctime: string;
    ctime_text: string;
  };
}>;
