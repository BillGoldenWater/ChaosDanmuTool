/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TCommandPack } from "../../type/commandPack/TCommandPack";
import { TAnyAppCommand } from "../../type/commandPack/appCommand/TAnyAppCommand";
import { TAnyBiliBiliCommand } from "../../type/commandPack/bilibiliCommand/TAnyBiliBiliCommand";

type CommandHistoryImplemented = {
  appCommand: TAnyAppCommand["cmd"][];
  bilibiliCommand: TAnyBiliBiliCommand["cmd"][];
};

export const commandHistoryImplemented: CommandHistoryImplemented = {
  appCommand: ["receiverStatusUpdate"],
  bilibiliCommand: [
    "activityUpdate",
    "CUT_OFF",
    "DANMU_MSG",
    "GUARD_BUY",
    "INTERACT_WORD",
    "LIVE",
    "parsedDanmuMsg",
    "PREPARING",
    "ROOM_BLOCK_MSG",
    "ROOM_REAL_TIME_MESSAGE_UPDATE",
    "SEND_GIFT",
    "SUPER_CHAT_MESSAGE",
    "WARNING",
    "WATCHED_CHANGE",
  ],
};

const chi = commandHistoryImplemented;

export function isImplementedCommand(obj: TCommandPack): boolean {
  if (obj.data.cmd === "bilibiliCommand")
    return chi.bilibiliCommand.indexOf(obj.data.data.cmd) !== -1;
  else return chi.appCommand.indexOf(obj.data.data.cmd) !== -1;
}
