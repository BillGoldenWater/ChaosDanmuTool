/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TRawUserLevel } from "./TRawUserLevel";

export function getUserUL(userLevel: TRawUserLevel): number {
  if (userLevel) {
    return <number>userLevel[0];
  }
  return null;
}
