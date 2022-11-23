/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TObjectKey } from "./TObjectKey";

type ForceType<T extends object, K extends TObjectKey<T>> = K extends keyof T
  ? T[K]
  : never;

type ForceIter<
  T extends object,
  L extends string,
  R extends string
> = L extends keyof T
  ? T[L] extends object
    ? R extends TObjectKey<T[L]>
      ? TGetType<T[L], R>
      : never
    : never
  : never;

export type TGetType<
  T extends object,
  K extends TObjectKey<T>
> = K extends `${infer L}.${infer R}` ? ForceIter<T, L, R> : ForceType<T, K>;
