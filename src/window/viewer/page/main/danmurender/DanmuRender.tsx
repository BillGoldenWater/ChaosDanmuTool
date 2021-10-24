import React from "react";
import style from "./DanmuRender.module.css";

class Props {
  danmuList: unknown[];
}

export class DanmuRender extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.DanmuRender}>
        {JSON.stringify(this.props.danmuList)}
      </div>
    );
  }
}
