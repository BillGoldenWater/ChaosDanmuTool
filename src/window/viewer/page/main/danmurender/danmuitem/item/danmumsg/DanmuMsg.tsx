import React from "react";
import style from "./DanmuMsg.module.css";
import { DanmuMsg as TDanmuMsg } from "../../../../../../../../utils/command/bilibili/DanmuMsg";
import { FansMedal } from "../../../../../../../../component/bilibili/fansmedal/FansMedal";

class Props {
  data: TDanmuMsg;
}

export class DanmuMsg extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.DanmuMsg}>
        <FansMedal medalInfo={this.props.data.medalInfo} />
        {this.props.data.uName}: {this.props.data.content}
      </div>
    );
  }
}
