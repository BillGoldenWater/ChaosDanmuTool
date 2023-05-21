/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DanmuMessage } from "./DanmuMessage";
import { GiftMessage } from "./GiftMessage";
import { CommandPacket } from "../../type/rust/command_packet";
import { memo } from "react";

export interface TDanmuItemInfo {
  item: CommandPacket;
  mergePrev: boolean;
  mergeNext: boolean;
}

export interface TDanmuItemProps {
  info: TDanmuItemInfo;
}

export const DanmuItem = memo(DanmuItemInner);

function DanmuItemInner(props: TDanmuItemProps) {
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
