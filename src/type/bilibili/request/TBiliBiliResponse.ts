/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TBiliBiliResponse<T> = {
  code: number;
  message: string;
  msg: string;
  ttl: number;
  data: T;
};
