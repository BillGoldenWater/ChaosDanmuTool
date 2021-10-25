import React from "react";
import style from "./FansMedal.module.css";
import { MedalInfo } from "../../../utils/command/bilibili/MedalInfo";

class Props {
  medalInfo: MedalInfo;
}

export class FansMedal extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.FansMedal}>
        <div className={style.FansMedal_name}>
          {this.props.medalInfo.medal_name}
        </div>
        <div className={style.FansMedal_lvl}>
          {this.props.medalInfo.medal_level}
        </div>
      </div>
    );
  }
}
