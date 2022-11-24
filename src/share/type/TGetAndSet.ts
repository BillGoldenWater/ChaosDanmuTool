/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TObjectKey } from "./TObjectKey";
import { TGetType } from "./TGetType";

export interface TObjGetAndSet<T extends object> {
  get<K extends TObjectKey<T>, V extends TGetType<T, K>>(
    key: K,
    defaultValue?: V
  ): V;

  set<K extends TObjectKey<T>, V extends TGetType<T, K>>(
    key: K,
    value: V
  ): void;

  set<K extends TObjectKey<T>, V extends TGetType<T, K>>(
    key: K,
    value: V
  ): Promise<void>;
}

export interface TGetAndSet<K, V> {
  get(key: K, defaultValue?: V): V;

  set(key: K, value: V): void;

  set(key: K, value: V): Promise<void>;
}
