/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ActivityUpdateCmd = "activityUpdate";

export type ActivityUpdate = {
  cmd: ActivityUpdateCmd;
  activity: number;
};

export function getActivityUpdateMessage(activity: number): ActivityUpdate {
  return {
    cmd: "activityUpdate",
    activity: activity,
  };
}

export function getActivityUpdateMessageCmd(): ActivityUpdateCmd {
  return "activityUpdate";
}
