/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliDanmuContent } from "../type/bilibili/TBiliBiliDanmuContent";

export type MessageCommandCmd = "messageCommand";

export type MessageCommand = {
  cmd: MessageCommandCmd;
  data: TBiliBiliDanmuContent;
};

export function getMessageCommand(data: TBiliBiliDanmuContent): MessageCommand {
  return {
    cmd: "messageCommand",
    data: data,
  };
}

export function getMessageCommandCmd(): MessageCommandCmd {
  return "messageCommand";
}
