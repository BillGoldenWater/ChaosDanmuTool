/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MessageLogCmd = "messageLog";

export type MessageLog = {
  cmd: MessageLogCmd;
  timestamp: number;
  message: unknown;
};

export function getMessageLogMessage(message: unknown): MessageLog {
  return {
    cmd: "messageLog",
    timestamp: new Date().getTime(),
    message: message,
  };
}

export function getMessageLogMessageCmd(): MessageLogCmd {
  return "messageLog";
}
