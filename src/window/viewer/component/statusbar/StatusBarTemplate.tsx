/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./StatusBar.css";

class Props {
  className: string;
  message: ReactNode;
  style?: React.CSSProperties;
}

export class StatusBarTemplate extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={this.props.className}>
        <div className="statusBar_content" style={this.props.style}>
          {this.props.message}
          <div className="statusBar_itemList">{this.props.children}</div>
        </div>
      </div>
    );
  }
}
