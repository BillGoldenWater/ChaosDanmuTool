/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MessageLogCmd = "messageLog";

export type MessageLog<T> = {
  cmd: MessageLogCmd;
  timestamp: number;
  message: T;
};

export function getMessageLogMessage<T>(message: T): MessageLog<T> {
  return {
    cmd: "messageLog",
    timestamp: new Date().getTime(),
    message: message,
  };
}

export function getMessageLogMessageCmd(): MessageLogCmd {
  return "messageLog";
}
