/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Immutable from "immutable";

export type TGiftConfig = Map<number, TGiftConfigItem>;
export type TGiftConfigState = Immutable.Map<number, TGiftConfigItem>;

export interface TGiftConfigItem {
  id: number;
  name: string;
  price: number;
  coin_type: "gold" | "silver";
  webp: string;
}

type TGiftConfigResponse = Map<string, unknown>;

export function parseGiftConfigResponse(response: unknown): TGiftConfig {
  const res = response as TGiftConfigResponse;
  const result: TGiftConfig = new Map();

  for (const itemMap of res.get("list") as Map<string, unknown>[]) {
    const item = Object.fromEntries(
      itemMap.entries()
    ) as unknown as TGiftConfigItem;
    if (!item.webp.startsWith("https")) {
      item.webp = item.webp.replace("http", "https");
    }
    result.set(item.id, item);
  }

  return result;
}
