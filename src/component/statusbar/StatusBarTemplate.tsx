import React, { ReactNode } from "react";
import style from "./StatusBar.module.css";

class Props {
  className: string;
  message: string | ReactNode;
  style?: React.CSSProperties;
}

export class StatusBarTemplate extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={this.props.className}>
        <div className={style.statusBar_content} style={this.props.style}>
          <div>{this.props.message}</div>
          <div className={style.statusBar_itemList}>{this.props.children}</div>
        </div>
      </div>
    );
  }
}
