import React, { ReactNode } from "react";
import style from "./StatusUpdate.module.css";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";
import { ReceiverStatusUpdate } from "../../../../../../../../utils/command/ReceiverStatusUpdate";

class Props {
  msg: DanmuMessage;
}

export class StatusUpdate extends React.Component<Props> {
  render(): ReactNode {
    const rsu: ReceiverStatusUpdate = this.props.msg as ReceiverStatusUpdate;
    return (
      <div className={style.StatusUpdate}>
        直播间连接状态现在为: {rsu.data.status}
      </div>
    );
  }
}
