/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TPropToString<T> = {
  [K in keyof T]: string;
};
