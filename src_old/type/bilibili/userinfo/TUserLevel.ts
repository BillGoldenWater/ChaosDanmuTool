/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TUserLevel = (number | string)[];

export function getUserUL(userLevel: TUserLevel): number {
  if (userLevel) {
    return <number>userLevel[0];
  }
  return null;
}
