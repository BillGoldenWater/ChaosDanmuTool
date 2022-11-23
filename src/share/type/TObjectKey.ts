/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AObjectKey = string | number;

export type TObjectKey<T extends object> = {
  [K in keyof T]: T[K] extends object
    ? K extends AObjectKey
      ? TObjectKey<T[K]> extends AObjectKey
        ? `${K}.${TObjectKey<T[K]>}`
        : K
      : K
    : K;
}[keyof T];
