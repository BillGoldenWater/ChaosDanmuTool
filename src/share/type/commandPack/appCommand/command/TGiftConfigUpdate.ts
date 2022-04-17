/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TGiftConfigUpdate = {
  cmd: "giftConfigUpdate";
  data: unknown; // TODO
};

export function getGiftConfigUpdate(data: unknown /*TODO*/): TGiftConfigUpdate {
  return {
    cmd: "giftConfigUpdate",
    data: data,
  };
}
