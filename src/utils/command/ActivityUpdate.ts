/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ActivityUpdateCmd = "activityUpdate";

export type ActivityUpdate = {
  cmd: ActivityUpdateCmd;
  data: {
    activity: number;
  };
};

export function getActivityUpdateMessage(activity: number): ActivityUpdate {
  return {
    cmd: "activityUpdate",
    data: {
      activity: activity,
    },
  };
}

export function getActivityUpdateMessageCmd(): ActivityUpdateCmd {
  return "activityUpdate";
}
