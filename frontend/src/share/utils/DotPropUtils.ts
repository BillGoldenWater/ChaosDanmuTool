/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TObjectKey } from "../type/TObjectKey";
import { TGetType } from "../type/TGetType";
import { getProperty, setProperty } from "dot-prop";

export function getProp<
  T extends object,
  K extends TObjectKey<T>,
  V extends TGetType<T, K>
>(obj: T, key: K, defaultValue?: V): V {
  return getProperty(obj, key as string, defaultValue) as V;
}

export function setProp<
  T extends object,
  K extends TObjectKey<T>,
  V extends TGetType<T, K>
>(obj: T, key: K, value: V) {
  setProperty(obj, key as string, value);
}
