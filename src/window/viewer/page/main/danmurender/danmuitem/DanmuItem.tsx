import React from "react";
import { DanmuMessage } from "../../../../../../utils/command/DanmuMessage";
import { DanmuMsg } from "./item/DanmuMsg";
import { parseDanmuMsg } from "../../../../../../utils/command/bilibili/DanmuMsg";

class Props {
  message: DanmuMessage;
}

export class DanmuItem extends React.Component<Props> {
  render(): JSX.Element {
    switch (this.props.message.cmd) {
      case "DANMU_MSG": {
        return <DanmuMsg data={parseDanmuMsg(this.props.message)} />;
      }
      case "STOP_LIVE_ROOM_LIST": {
        return null;
      }
      default: {
        return <div>未知的消息: {JSON.stringify(this.props.message)}</div>;
      }
    }
  }
}
