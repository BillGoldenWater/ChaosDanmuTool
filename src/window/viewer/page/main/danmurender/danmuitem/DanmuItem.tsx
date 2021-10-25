import React from "react";
import { DanmuMessage } from "../../../../../../utils/command/DanmuMessage";
import { DanmuMsg } from "./item/danmumsg/DanmuMsg";
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
        console.log("未知的消息: ");
        console.log(this.props.message);
        return null;
      }
    }
  }
}
