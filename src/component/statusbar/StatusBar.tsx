import React from "react";
import style from "./StatusBar.module.css";
import { StatusBarTemplate } from "./StatusBarTemplate";

class Props {
  message: string;
  backgroundColor?: string;
  borderColor?: string;
}

export class StatusBar extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <StatusBarTemplate
          className={style.statusBar}
          message={this.props.message}
          backgroundColor={this.props.backgroundColor}
          borderColor={this.props.borderColor}
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
