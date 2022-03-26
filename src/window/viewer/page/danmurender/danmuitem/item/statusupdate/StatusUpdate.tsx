/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import style from "./StatusUpdate.module.css";
import { TBiliBiliDanmuContent } from "../../../../../../../type/bilibili/TBiliBiliDanmuContent";
import { ReceiverStatusUpdate } from "../../../../../../../command/ReceiverStatusUpdate";

class Props {
  msg: TBiliBiliDanmuContent;
}

export class StatusUpdate extends React.Component<Props> {
  render(): ReactNode {
    const rsu: ReceiverStatusUpdate = this.props.msg as ReceiverStatusUpdate;
    let statusMsg = "NULL";
    let color = "#fff";

    switch (rsu.data.status) {
      case "connecting": {
        statusMsg = "连接中";
        color = "#e90";
        break;
      }
      case "open": {
        statusMsg = "已连接";
        color = "#0e0";
        break;
      }
      case "close": {
        statusMsg = "未连接";
        color = "#ee0";
        break;
      }
      case "error": {
        statusMsg = "发生了错误";
        color = "#e00";
        break;
      }
    }

    return (
      <div
        className={style.StatusUpdate}
        style={{
          color: color,
        }}
      >
        直播间连接状态现在为: {statusMsg}
      </div>
    );
  }
}
