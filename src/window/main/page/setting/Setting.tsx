import React from "react";
import style from "./Setting.module.css";
import { ConfigFileManager } from "./configfilemanager/ConfigFileManager";

class Props {}

export class Setting extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.setting}>
        <ConfigFileManager />
      </div>
    );
  }
}
