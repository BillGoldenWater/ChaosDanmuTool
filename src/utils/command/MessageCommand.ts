export type MessageCommandCmd = "messageCommand";

export type MessageCommand = {
  cmd: MessageCommandCmd;
  data: string;
};

export function getMessageCommand(data: string): string {
  const messageObj: MessageCommand = {
    cmd: "messageCommand",
    data: data,
  };
  return JSON.stringify(messageObj);
}

export function getMessageCommandCmd(): MessageCommandCmd {
  return "messageCommand";
}
