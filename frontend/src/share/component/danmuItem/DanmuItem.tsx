/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CommandPacket } from "../../type/rust/command/CommandPacket";
import { DanmuMessage } from "./DanmuMessage";

export interface TDanmuItemProps {
  item: CommandPacket;
  prevItem?: CommandPacket;
  nextItem?: CommandPacket;
}

export function DanmuItem(props: TDanmuItemProps) {
  const { item } = props;

  if (item.cmd === "biliBiliCommand") {
    const cmd = item.data;

    switch (cmd.cmd) {
      case "danmuMessage": {
        return <DanmuMessage {...props} />;
      }
      default:
        return <div>Error: {cmd.cmd} is not implemented</div>;
    }
  } else {
    return <div>Error: unexpected non bilibiliCommand {item.cmd}</div>;
  }
}
