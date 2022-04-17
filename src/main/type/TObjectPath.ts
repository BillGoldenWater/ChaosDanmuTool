/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AObjectKey = string | number;

export type AObject = Record<AObjectKey, unknown>;

export type ObjectPath<T extends AObject> = {
  [K in keyof T]: T[K] extends AObject
    ? K extends AObjectKey
      ? ObjectPath<T[K]> extends AObjectKey
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `${K}.${ObjectPath<T[K]>}`
        : K
      : K
    : K;
}[keyof T];
