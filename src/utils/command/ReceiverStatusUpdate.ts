export type ReceiverStatus = "open" | "close" | "error";

export type ReceiverStatusUpdateCmd = "receiverStatusUpdate";

export type ReceiverStatusUpdate = {
  cmd: ReceiverStatusUpdateCmd;
  data: {
    status: ReceiverStatus;
  };
};

export function getStatusUpdateMessage(status: ReceiverStatus): string {
  const messageObj: ReceiverStatusUpdate = {
    cmd: "receiverStatusUpdate",
    data: {
      status: status,
    },
  };

  return JSON.stringify(messageObj);
}

export function getStatusUpdateMessageCmd(): ReceiverStatusUpdateCmd {
  return "receiverStatusUpdate";
}
