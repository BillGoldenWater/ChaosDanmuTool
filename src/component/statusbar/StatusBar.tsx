import React from "react";
import style from "./StatusBar.module.css";
import { StatusBarTemplate } from "./StatusBarTemplate";

class Props {
  message: string;
}

export class StatusBar extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <StatusBarTemplate
          className={style.statusBar}
          message={this.props.message}
        >
          {this.props.children}
        </StatusBarTemplate>
        <StatusBarTemplate
          className={style.statusBar_placeholder + " " + style.statusBar}
          message={this.props.message}
        >
          {this.props.children}
        </StatusBarTemplate>
      </div>
    );
  }
}
