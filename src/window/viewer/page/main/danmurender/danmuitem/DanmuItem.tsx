import React from "react";
import { DanmuMessage } from "../../../../../../utils/command/DanmuMessage";

class Props {
  message: DanmuMessage;
}

export class DanmuItem extends React.Component<Props> {
  render(): JSX.Element {
    return <div>{this.props.message.cmd}</div>;
  }
}
