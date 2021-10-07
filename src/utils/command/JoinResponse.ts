export type JoinResponseCmd = "joinResponse";

export type JoinResponse = {
  cmd: JoinResponseCmd;
  data: {
    code: number;
  };
};

export function getJoinResponseMessage(code: number): string {
  const messageObj: JoinResponse = {
    cmd: "joinResponse",
    data: {
      code: code,
    },
  };
  return JSON.stringify(messageObj);
}

export function getJoinResponseMessageCmd(): JoinResponseCmd {
  return "joinResponse";
}
