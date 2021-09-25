import React from "react";
import style from "./Setting.module.css";
import { Config } from "../../../../utils/Config";

class Props {
  config: Config;
  setConfig: (config: Config) => void;
}

export class Setting extends React.Component<Props> {
  render(): JSX.Element {
    return <div className={style.setting}>1</div>;
  }
}
