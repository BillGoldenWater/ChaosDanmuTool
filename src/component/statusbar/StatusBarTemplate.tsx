import React from "react";
import style from "./StatusBar.module.css";

class Props {
  className: string;
  message: string;
  backgroundColor?: string;
  borderColor?: string;
}

export class StatusBarTemplate extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={this.props.className}>
        <div
          className={style.statusBar_content}
          style={{
            borderColor: this.props.borderColor,
            backgroundColor: this.props.backgroundColor,
          }}
        >
          <div>{this.props.message}</div>
          <div className={style.statusBar_itemList}>{this.props.children}</div>
        </div>
      </div>
    );
  }
}
