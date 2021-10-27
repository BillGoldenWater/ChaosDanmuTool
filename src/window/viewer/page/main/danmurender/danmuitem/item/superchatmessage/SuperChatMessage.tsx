import React from "react";
import style from "./SuperChatMessage.module.css";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";

class Props {
  data: DanmuMessage;
}

export class SuperChatMessage extends React.Component<Props> {
  render(): JSX.Element {
    return <div className={style.SuperChatMessage}>1</div>;
  }
}
