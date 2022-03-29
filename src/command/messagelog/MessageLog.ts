/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { v4 as uuidv4 } from "uuid";

export type MessageLogCmd = "messageLog";

export type MessageLog<T> = {
  cmd: MessageLogCmd;
  timestamp: number;
  uuid: string;
  message: T;
};

export function getMessageLogMessage<T>(message: T): MessageLog<T> {
  return {
    cmd: "messageLog",
    timestamp: new Date().getTime(),
    uuid: uuidv4(),
    message: message,
  };
}

export function getMessageLogMessageCmd(): MessageLogCmd {
  return "messageLog";
}
