/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Immutable from "immutable";
import { GiftConfigItem } from "./rust/command_packet/app_command/gift_config_update";

export type TGiftConfigArr = GiftConfigItem[];
export type TGiftConfig = Map<number, GiftConfigItem>;
export type TGiftConfigState = Immutable.Map<number, GiftConfigItem>;

export function convertGiftConfig(giftConfigArr: TGiftConfigArr): TGiftConfig {
  const result = new Map();

  for (const item of giftConfigArr) {
    result.set(item.id, item);
  }

  return result;
}
