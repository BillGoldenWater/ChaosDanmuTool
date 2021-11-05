import React, { ReactNode } from "react";
import style from "./RoomStatusChange.module.css";
import { DanmuMessage } from "../../../../../../../utils/command/DanmuMessage";
import { ConfigContext } from "../../../../../utils/ConfigContext";

class Props {
  msg: DanmuMessage;
}

export class RoomStatusChange extends React.Component<Props> {
  render(): ReactNode {
    let status = "";
    switch (this.props.msg.cmd) {
      case "LIVE": {
        status = "直播中";
        break;
      }
      case "PREPARING": {
        status = "准备中";
        break;
      }
    }
    return (
      <div className={style.RoomStatusChange}>
        直播间
        <ConfigContext.Consumer>
          {({ config }) => (
            <div style={config.style.userName}>{this.props.msg.roomid}</div>
          )}
        </ConfigContext.Consumer>
        状态更改为{status}
      </div>
    );
  }
}
