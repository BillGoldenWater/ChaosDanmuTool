/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function rgbI2S(num: number): string {
  return "#" + num.toString(16).padStart(6, "0");
}

export function rgbaI2S(num: number): string {
  return "#" + num.toString(16).padStart(8, "0");
}
