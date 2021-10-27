import React from "react";
import { DanmuMessage } from "../../../../../../utils/command/DanmuMessage";
import { DanmuMsg } from "./item/danmumsg/DanmuMsg";
import { parseDanmuMsg } from "../../../../../../utils/command/bilibili/DanmuMsg";
import { SuperChatMessage } from "./item/superchatmessage/SuperChatMessage";

class Props {
  message: DanmuMessage;
}

export class DanmuItem extends React.Component<Props> {
  render(): JSX.Element {
    const msg: DanmuMessage = this.props.message;
    switch (msg.cmd) {
      case "DANMU_MSG": {
        return <DanmuMsg data={parseDanmuMsg(msg)} />;
      }
      case "SUPER_CHAT_MESSAGE": {
        return <SuperChatMessage data={msg} />;
      }
    }
    return null;
  }
}
