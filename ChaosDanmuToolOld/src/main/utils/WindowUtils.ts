/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BrowserWindow, Display, screen } from "electron";

type WindowTryMove = {
  [key: string]: {
    count: number;
    lastTS: number;
  };
};

const windowTryMove: WindowTryMove = {};

let allDisplay: Display[];

export function trySnapWindowOnMove(
  name: string,
  window: BrowserWindow,
  event: Electron.Event,
  newBounds: Electron.Rectangle
): void {
  allDisplay = screen.getAllDisplays();

  const nB = newBounds;
  const lB = window.getBounds();

  const centerX = lB.x + Math.round(lB.width / 2);
  const centerY = lB.y + Math.round(lB.height / 2);

  const display = allDisplay.find((value) => {
    const bounds = value.bounds;

    return (
      bounds.x <= centerX &&
      bounds.y <= centerY &&
      bounds.x + bounds.width >= centerX &&
      bounds.y + bounds.height >= centerY
    );
  });
  if (!display) {
    window.setPosition(0, 0, true);
    event.preventDefault();
    return;
  }
  const displayBounds = display.bounds;
  const range = {
    ...displayBounds,
    xMax: displayBounds.x + displayBounds.width,
    yMax: displayBounds.y + displayBounds.height,
  };

  /**
   * last position
   *
   * 0,1 top left x,y
   *
   * 2,3 bottom right x,y
   */
  const lP = [
    lB.x, // top left
    lB.y,
    lB.x + lB.width, // bottom right
    lB.y + lB.height,
  ];
  /**
   * new position
   *
   * 0,1 top left x,y
   *
   * 2,3 bottom right x,y
   */
  const nP = [
    nB.x, // top left
    nB.y,
    nB.x + nB.width, // bottom right
    nB.y + nB.height,
  ];
  /**
   * last distance
   *
   * 0: left distance
   *
   * 1: top distance
   *
   * 2: right distance
   *
   * 3: bottom distance
   */
  const lD = [
    lP[0] - range.x, // left distance
    lP[1] - range.y, // top distance
    range.xMax - lP[2], // right distance
    range.yMax - lP[3], // bottom distance
  ];
  /**
   * new distance
   *
   * 0: left distance
   *
   * 1: top distance
   *
   * 2: right distance
   *
   * 3: bottom distance
   */
  const nD = [
    nP[0] - range.x, // left distance
    nP[1] - range.y, // top distance
    range.xMax - nP[2], // right distance
    range.yMax - nP[3], // bottom distance
  ];

  const detectDistance = 50;
  /**
   * move direction
   *
   * not detected: 0  in: 1  out: 2  no change: 3
   *
   * 0: left distance
   *
   * 1: top distance
   *
   * 2: right distance
   *
   * 3: bottom distance
   */
  const moveD = lD.map((value, index) => {
    // last value
    const lV = Math.min(value, detectDistance);
    const nV = Math.min(nD[index], detectDistance);

    if (lV == 50 && nV == 50) return 0;
    if (nV > lV) {
      return 1;
    } else if (nV < lV) {
      return 2;
    } else {
      return 3;
    }
  });

  // ms
  const resetWaitTime = 1000;
  // pixel
  const maxLockDistance = 50;
  // no lock after maxLockDistance reached
  const noLockDistance = 5;

  const getTimeInSecond = () => {
    return new Date().getTime();
  };
  const resetCount = () => {
    windowTryMove[name] = { count: 0, lastTS: getTimeInSecond() };
  };
  const tryPreventDefault = () => {
    if (
      windowTryMove[name] == null ||
      windowTryMove[name].lastTS < getTimeInSecond() - resetWaitTime
    ) {
      resetCount();
    }
    windowTryMove[name].count++;
    if (windowTryMove[name].count >= maxLockDistance) {
      if (windowTryMove[name].count >= maxLockDistance + noLockDistance) {
        resetCount();
      }
      return;
    }

    event.preventDefault();
    windowTryMove[name].lastTS = getTimeInSecond();
  };

  let noXMove = false;
  let noYMove = false;
  /**
   * final position
   *
   * 0,1 top left x,y
   *
   * 2,3 bottom right x,y
   */
  const fP = lP.map((value) => value);
  lD.forEach((value, index) => {
    if (value != 0) return;

    if (moveD[index] == 2 && nD[index] <= 0) {
      tryPreventDefault();
      switch (index) {
        case 0: // x
        case 2: {
          fP[0] = lP[0]; //prevent move
          noXMove = true;
          break;
        }
        case 1: // y
        case 3: {
          fP[1] = lP[1]; //prevent move
          noYMove = true;
          break;
        }
      }
    } else if (moveD[index] == 3) {
      switch (index) {
        case 0: // x
        case 2: {
          if (!noYMove) {
            fP[1] = nP[1];
          }
          break;
        }
        case 1: // y
        case 3: {
          if (!noXMove) {
            fP[0] = nP[0];
          }
          break;
        }
      }
    }
  });
  window.setPosition(fP[0], fP[1]);
}
