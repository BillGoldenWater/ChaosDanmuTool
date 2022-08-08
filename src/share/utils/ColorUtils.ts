/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function rgbI2S(num: number): string {
  if (typeof num === "number") {
    return "#" + num.toString(16).padStart(6, "0");
  } else if (typeof num == "string") {
    return num;
  } else {
    return "#000";
  }
}

export function rgbaI2S(num: number): string {
  if (typeof num === "number") {
    return "#" + num.toString(16).padStart(8, "0");
  } else if (typeof num == "string") {
    return num;
  } else {
    return "#000";
  }
}
