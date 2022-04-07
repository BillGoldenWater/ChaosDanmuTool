/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TAnyMessage } from "../../type/TAnyMessage";

export const commandHistoryImplemented = {
  command: [
    "messageCommand",
    "activityUpdate",
    "joinResponse",
    "receiverStatusUpdate",
  ],
  bilibiliCommand: [
    "DANMU_MSG",
    "LIVE",
    "PREPARING",
    "SUPER_CHAT_MESSAGE",
    "GUARD_BUY",
    "INTERACT_WORD",
    "ROOM_BLOCK_MSG",
    "ROOM_REAL_TIME_MESSAGE_UPDATE",
    "SEND_GIFT",
    "WATCHED_CHANGE",
  ],
};

export function isImplementedCommand(obj: TAnyMessage): boolean {
  if (obj.cmd === "messageCommand")
    return (
      commandHistoryImplemented.bilibiliCommand.indexOf(obj.data.cmd) !== -1
    );
  else return commandHistoryImplemented.command.indexOf(obj.cmd) !== -1;
}
