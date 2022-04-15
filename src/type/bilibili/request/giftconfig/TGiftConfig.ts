/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGiftInfo } from "./TGiftInfo";
import { TBiliBiliResponse } from "../TBiliBiliResponse";

export type TGiftConfig = {
  data: Map<number, TGiftInfo>;
};

export function parseGiftConfig(
  giftConfigRes: TGiftConfigResponse
): TGiftConfig {
  const giftConfig: TGiftConfig = { data: new Map<number, TGiftInfo>() };

  if (giftConfigRes == <TGiftConfigResponse>{}) {
    return giftConfig;
  }

  for (const i in giftConfigRes.data.list) {
    const giftInfo: TGiftInfo = giftConfigRes.data.list[i];
    giftConfig.data.set(giftInfo.id, giftInfo);
  }

  return giftConfig;
}

export type TGiftConfigResponse = TBiliBiliResponse<{
  list: TGiftInfo[];
  combo_resources: [];
  guard_resources: [];
}>;
