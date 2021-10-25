import React from "react";
import { DanmuMsg as TDanmuMsg } from "../../../../../../../utils/command/bilibili/DanmuMsg";

class Props {
  data: TDanmuMsg;
}

export class DanmuMsg extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        {this.props.data.uName}: {this.props.data.content}
      </div>
    );
  }
}
