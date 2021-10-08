export type MessageLogCmd = "messageLog";

export type MessageLog = {
  cmd: MessageLogCmd;
  data: {
    timestamp: number;
    message: string;
  };
};

export function getMessageLogMessage(message: string): MessageLog {
  return {
    cmd: "messageLog",
    data: {
      timestamp: new Date().getTime(),
      message: message,
    },
  };
}

export function getMessageLogMessageCmd(): MessageLogCmd {
  return "messageLog";
}
