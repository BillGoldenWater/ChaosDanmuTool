/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TMedalInfo } from "./TMedalInfo";

export type TSendGift = {
  cmd: "SEND_GIFT";
  data: {
    action: string;
    batch_combo_id: string;
    batch_combo_send: unknown;
    beatId: string;
    biz_source: string;
    blind_gift: unknown;
    broadcast_id: number;
    coin_type: "gold" | "silver";
    combo_resources_id: number;
    combo_send: unknown;
    combo_stay_time: number; // second
    combo_total_coin: number;
    crit_prob: number;
    demarcation: number;
    discount_price: number;
    dmscore: number;
    draw: number;
    effect: number;
    effect_block: number;
    face: string;
    giftId: number;
    giftName: string;
    giftType: number;
    gold: number;
    guard_level: number;
    is_first: true;
    is_special_batch: number;
    magnification: number;
    medal_info: TMedalInfo;
    name_color: string;
    num: number;
    original_gift_name: string;
    price: number;
    rcost: number;
    remain: number;
    rnd: string;
    send_master: unknown;
    silver: number;
    super: number;
    super_batch_gift_num: number;
    super_gift_num: number;
    svga_block: number;
    tag_image: string;
    tid: string;
    timestamp: number;
    top_list: unknown;
    total_coin: number;
    uid: number;
    uname: string;
  };
};
