import React from "react";
import style from "./FansMedal.module.css";
import { MedalInfo } from "../../../utils/command/bilibili/MedalInfo";
import { rgbI2S } from "../../../utils/FormatConverters";

class Props {
  medalInfo: MedalInfo;
}

export class FansMedal extends React.Component<Props> {
  render(): JSX.Element {
    if (!this.props.medalInfo || !this.props.medalInfo.is_lighted) return null;

    const medal_color_border = rgbI2S(this.props.medalInfo.medal_color_border);
    const medal_color_start = rgbI2S(this.props.medalInfo.medal_color_start);
    const medal_color_end = rgbI2S(this.props.medalInfo.medal_color_end);
    const medal_color = rgbI2S(this.props.medalInfo.medal_color);
    return (
      <div className={style.FansMedal}>
        <div
          className={style.FansMedal_name}
          style={{
            borderColor: medal_color_border,
            backgroundImage: "linear-gradient(45deg,{0},{1})"
              .replace("{0}", medal_color_start)
              .replace("{1}", medal_color_end),
          }}
        >
          {this.props.medalInfo.medal_name}
        </div>
        <div
          className={style.FansMedal_lvl}
          style={{
            borderColor: medal_color_border,
            color: medal_color,
          }}
        >
          {this.props.medalInfo.medal_level}
        </div>
      </div>
    );
  }
}
