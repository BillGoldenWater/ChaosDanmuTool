/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TObjectKey } from "./TObjectKey";
import { TGetType } from "./TGetType";

export type TObjGetAndSet<T extends object> = TGetAndSet<
  TObjectKey<T>,
  TGetType<T, TObjectKey<T>>
>;

export interface TGetAndSet<K, V> {
  get(key: K, defaultValue?: V): V;

  set(key: K, value: V): void;

  set(key: K, value: V): Promise<void>;
}
