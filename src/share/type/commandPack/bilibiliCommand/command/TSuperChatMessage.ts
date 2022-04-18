/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TMedalInfo } from "../../../bilibili/userinfo/TMedalInfo";
import { TUserInfo } from "../../../bilibili/userinfo/TUserInfo";

export type TSuperChatMessage = {
  cmd: "SUPER_CHAT_MESSAGE";
  data: {
    background_bottom_color: string;
    background_color: string;
    background_color_end: string;
    background_color_start: string;
    background_icon: string;
    background_image: string;
    background_price_color: string;
    color_point: number;
    dmscore: number;
    end_time: number;
    gift: {
      gift_id: number;
      gift_name: string;
      num: number;
    };
    id: number;
    is_ranked: number;
    is_send_audit: string;
    medal_info: TMedalInfo;
    message: string;
    message_font_color: string;
    message_trans: string;
    price: number;
    rate: number;
    start_time: number;
    time: number;
    token: string;
    trans_mark: number;
    ts: number;
    uid: number;
    user_info: TUserInfo;
  };
  roomid: string;
};
