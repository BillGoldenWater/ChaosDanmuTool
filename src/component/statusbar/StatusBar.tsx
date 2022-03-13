/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import style from "./StatusBar.module.css";
import { StatusBarTemplate } from "./StatusBarTemplate";

class Props {
  message: string | ReactNode;
  style?: React.CSSProperties;
}

export class StatusBar extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <StatusBarTemplate
          className={style.statusBar}
          message={this.props.message}
          style={this.props.style}
        >
          {this.props.children}
        </StatusBarTemplate>
        <StatusBarTemplate
          className={style.statusBar_placeholder + " " + style.statusBar}
          message={this.props.message}
          style={this.props.style}
        >
          {this.props.children}
        </StatusBarTemplate>
      </div>
    );
  }
}
