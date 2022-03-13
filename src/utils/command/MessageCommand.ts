/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MessageCommandCmd = "messageCommand";

export type MessageCommand = {
  cmd: MessageCommandCmd;
  data: string;
};

export function getMessageCommand(data: string): MessageCommand {
  return {
    cmd: "messageCommand",
    data: data,
  };
}

export function getMessageCommandCmd(): MessageCommandCmd {
  return "messageCommand";
}
