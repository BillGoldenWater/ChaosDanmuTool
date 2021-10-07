export type ActivityUpdateCmd = "activityUpdate";

export type ActivityUpdate = {
  cmd: ActivityUpdateCmd;
  data: {
    activity: number;
  };
};

export function getActivityUpdateMessage(activity: number): string {
  const messageObj: ActivityUpdate = {
    cmd: "activityUpdate",
    data: {
      activity: activity,
    },
  };
  return JSON.stringify(messageObj);
}

export function getActivityUpdateMessageCmd(): ActivityUpdateCmd {
  return "activityUpdate";
}
