/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function takeNotNull(...args) {
  for (let arg of args) {
    if (arg != null) return arg;
  }
  return null;
}