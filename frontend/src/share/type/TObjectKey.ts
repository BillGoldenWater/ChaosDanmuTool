/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ObjectKey = string | number | bigint | boolean | null | undefined;

export type TObjectKey<T extends object> = {
  [K in keyof T]: K extends ObjectKey
    ? T[K] extends object
      // eslint-disable-next-line @typescript-eslint/ban-types
      ? T[K] extends Function
        ? never
        : K | `${K}.${TObjectKey<T[K]>}`
      : K
    : never;
}[keyof T];
