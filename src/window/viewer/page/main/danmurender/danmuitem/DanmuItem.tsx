import React from "react";
import { DanmuMessage } from "../../../../../../utils/command/DanmuMessage";
import { DanmuMsg } from "./item/danmumsg/DanmuMsg";
import { parseDanmuMsg } from "../../../../../../model/DanmuMsg";
import { SuperChatMessage } from "./item/superchatmessage/SuperChatMessage";
import { InteractWord } from "./item/interactword/InteractWord";
import { InteractWord as TInteractWord } from "../../../../../../model/InteractWord";

class Props {
  message: DanmuMessage;
}

export class DanmuItem extends React.Component<Props> {
  render(): JSX.Element {
    const msg: DanmuMessage = this.props.message;
    switch (msg.cmd) {
      case "INTERACT_WORD": {
        return <InteractWord data={msg as unknown as TInteractWord} />;
      }
      case "DANMU_MSG": {
        return <DanmuMsg data={parseDanmuMsg(msg)} />;
      }
      case "SUPER_CHAT_MESSAGE": {
        return <SuperChatMessage msg={msg} />;
      }
    }
    return null;
  }
}
