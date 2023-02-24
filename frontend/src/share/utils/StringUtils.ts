/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const canvasForMeasure = document.createElement("canvas");
const canvasForMeasureCtx = canvasForMeasure.getContext("2d");

export function measureText(text: string, font: string) {
  if (canvasForMeasureCtx) {
    canvasForMeasureCtx.font = font;
    return canvasForMeasureCtx.measureText(text);
  } else {
    return undefined;
  }
}
