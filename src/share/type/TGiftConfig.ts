/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TGiftConfig = Map<number, TGiftConfigItem>;

interface TGiftCountMap {
  num: number;
  text: string;
  web_svga: string;
  vertical_svga: string;
  horizontal_svga: string;
  special_color: string;
  effect_id: number;
}

interface TGiftBanner {
  app_pic: string;
  web_pic: string;
  left_text: string;
  left_color: string;
  button_text: string;
  button_color: string;
  button_pic_color: string;
  jump_url: string;
  jump_to: number;
  web_pic_url: string;
  web_jump_url: string;
}

export interface TGiftConfigItem {
  id: number;
  name: string;
  price: number;
  type: number;
  coin_type: "gold" | "silver";
  bag_gift: number;
  effect: number;
  corner_mark: string;
  corner_background: string;
  broadcast: number;
  draw: number;
  stay_time: number;
  animation_frame_num: number;
  desc: string;
  rule: string;
  rights: string;
  privilege_required: number;
  count_map: TGiftCountMap;
  img_basic: string;
  img_dynamic: string;
  frame_animation: string;
  gif: string;
  webp: string;
  full_sc_web: string;
  full_sc_horizontal: string;
  full_sc_vertical: string;
  full_sc_horizontal_svga: string;
  full_sc_vertical_svga: string;
  bullet_head: string;
  bullet_tail: string;
  limit_interval: number;
  bind_ruid: number;
  bind_roomid: number;
  gift_type: number;
  combo_resources_id: number;
  max_send_limit: number;
  weight: number;
  goods_id: number;
  has_imaged_gift: number;
  left_corner_text: string;
  left_corner_background: string;
  gift_banner: TGiftBanner | null;
  diy_count_map: number;
  effect_id: number;
  first_tips: string;
}

export interface TGiftConfigResponse {
  list: TGiftConfigItem[];
}

export function parseGiftConfigResponse(response: unknown): TGiftConfig {
  let res = response as TGiftConfigResponse;
  let result: TGiftConfig = new Map();

  for (const item of res.list) {
    result.set(item.id, item);
  }

  return result;
}
