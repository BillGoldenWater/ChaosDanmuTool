/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TBiliBiliCommand<T> = {
  cmd: "bilibiliCommand";
  data: T;
};

export function getBiliBiliCommand<T>(data: T): TBiliBiliCommand<T> {
  return { cmd: "bilibiliCommand", data: data };
}
