/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGiftConfigResponse } from "../../../../../main/type/request/bilibili/giftconfig/TGiftConfig";

export type TGiftConfigUpdate = {
  cmd: "giftConfigUpdate";
  data: TGiftConfigResponse;
};

export function getGiftConfigUpdateCommand(
  data: TGiftConfigResponse
): TGiftConfigUpdate {
  return {
    cmd: "giftConfigUpdate",
    data: data,
  };
}
