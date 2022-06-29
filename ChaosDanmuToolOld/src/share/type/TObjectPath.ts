/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

export type AObjectKey = string | number;

export type AObject = Record<AObjectKey, unknown>;

export type ObjectPath<T extends AObject> = {
  [K in keyof T]: T[K] extends AObject
    ? K extends AObjectKey
      ? ObjectPath<T[K]> extends AObjectKey
        ? // @ts-ignore
          `${K}.${ObjectPath<T[K]>}`
        : K
      : K
    : K;
}[keyof T];
