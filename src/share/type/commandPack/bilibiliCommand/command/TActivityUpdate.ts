/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TActivityUpdate = {
  cmd: "activityUpdate";
  activity: number;
};

export function getActivityUpdateCommand(activity: number): TActivityUpdate {
  return {
    cmd: "activityUpdate",
    activity: activity,
  };
}
