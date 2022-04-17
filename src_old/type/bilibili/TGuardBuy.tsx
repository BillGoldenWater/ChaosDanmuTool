/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TGuardBuy = {
  cmd: "GUARD_BUY";
  data: {
    uid: number;
    username: string;
    guard_level: number;
    num: number;
    price: number;
    gift_id: number;
    gift_name: string;
    start_time: number;
    end_time: number;
  };
};

export function getGuardIconUrl(level: number): string {
  return `https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard${level}.png`;
}
