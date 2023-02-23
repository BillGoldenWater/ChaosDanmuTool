/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TObjectKey } from "./TObjectKey";
import { TGetType } from "./TGetType";

export type TObjGetAndSet<T extends object> = {
  get: TObjGet<T>;
  set: TObjSet<T>;
};

export type TObjGet<T extends object> = <
  K extends TObjectKey<T>,
  V extends TGetType<T, K>
>(
  key: K,
  defaultValue?: V
) => V;

export type TObjSet<T extends object> =
  | (<K extends TObjectKey<T>, V extends TGetType<T, K>>(
      key: K,
      value: V
    ) => void)
  | (<K extends TObjectKey<T>, V extends TGetType<T, K>>(
      key: K,
      value: V
    ) => Promise<void>);

export type TGetAndSet<K, V> = { get: TGet<K, V>; set: TSet<K, V> };

export type TGet<K, V> = (key: K, defaultValue?: V) => V;

export type TSet<K, V> =
  | ((key: K, value: V) => void)
  | ((key: K, value: V) => Promise<void>);
