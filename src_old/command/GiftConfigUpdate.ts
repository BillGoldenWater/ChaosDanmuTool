/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGiftConfigResponse } from "../type/bilibili/request/giftconfig/TGiftConfig";

export type GiftConfigUpdateCmd = "updateGiftConfig";

export type GiftConfigUpdate = {
  cmd: GiftConfigUpdateCmd;
  data: TGiftConfigResponse;
};

export function getGiftConfigUpdateMessage(
  giftConfig: TGiftConfigResponse
): GiftConfigUpdate {
  return {
    cmd: "updateGiftConfig",
    data: giftConfig,
  };
}

export function getGiftConfigUpdateCmd(): GiftConfigUpdateCmd {
  return "updateGiftConfig";
}
