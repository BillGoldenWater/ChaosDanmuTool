/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export function isInt(text: string, radix?: number): boolean {
  try {
    return parseInt(text, radix).toString(radix) === text;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return false;
}

export function isFloat(text: string): boolean {
  try {
    return parseFloat(text).toString() === text;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return false;
}
