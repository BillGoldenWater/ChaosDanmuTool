/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TPropTo<T, To> = {
  [K in keyof T]: To;
};
