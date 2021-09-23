export type Status = "open" | "close" | "error";

export type ReceiverStatusUpdate = {
  cmd: "receiverStatusUpdate";
  data: {
    status: Status;
  };
};

export function getStatusUpdateMessage(status: Status): string {
  const messageObj: ReceiverStatusUpdate = {
    cmd: "receiverStatusUpdate",
    data: {
      status: status,
    },
  };
  
  return JSON.stringify(messageObj);
}
