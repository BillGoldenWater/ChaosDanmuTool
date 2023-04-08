/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CommandPacket } from "../../type/rust/command/CommandPacket";
import { DanmuMessage } from "./DanmuMessage";
import { GiftMessage } from "./GiftMessage";

export interface TDanmuItemInfo {
  item: CommandPacket;
  mergePrev: boolean;
  mergeNext: boolean;
  giftNumSum: number;
}

export interface TDanmuItemProps {
  info: TDanmuItemInfo;
}

export function DanmuItem(props: TDanmuItemProps) {
  const {
    info,
    info: { item },
  } = props;

  if (item.cmd === "biliBiliCommand") {
    const cmd = item.data;

    switch (cmd.cmd) {
      case "danmuMessage": {
        return <DanmuMessage info={info} />;
      }
      case "giftMessage": {
        return <GiftMessage info={info} />;
      }
      default:
        return <div>Error: {cmd.cmd} is not implemented</div>;
    }
  } else {
    return <div>Error: unexpected non bilibiliCommand {item.cmd}</div>;
  }
}
