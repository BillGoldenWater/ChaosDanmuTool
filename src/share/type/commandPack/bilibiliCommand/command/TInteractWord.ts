/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFansMedal } from "../../../bilibili/userinfo/TFansMedal";

export type TInteractWord = {
  cmd: "INTERACT_WORD";
  data: {
    contribution: unknown;
    dmscore: number;
    fans_medal: TFansMedal;
    identities: unknown;
    is_spread: number;
    msg_type: number;
    roomid: number;
    score: number;
    spread_desc: string;
    spread_info: string;
    tail_icon: number;
    timestamp: number;
    trigger_time: number;
    uid: number;
    uname: string;
    uname_color: string;
  };
};

export const InteractWordType = {
  join: 1,
  follow: 2,
  share: 3,
};
