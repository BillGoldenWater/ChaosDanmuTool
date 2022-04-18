/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TWatchedChange = {
  cmd: "WATCHED_CHANGE";
  data: {
    num: number;
    text_small: string;
    text_large: string;
  };
};

export function getWatchedChangeCommand(num: number): TWatchedChange {
  return {
    cmd: "WATCHED_CHANGE",
    data: { num: num, text_large: `${num}人看过`, text_small: num.toString() },
  };
}
