/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./StatusBar.css";
import { StatusBarTemplate } from "./StatusBarTemplate";
import { MainState } from "../../page/main";
import { StatusBarMessage } from "./StatusBarMessage";
import { ConfigContext } from "../../utils/ConfigContext";

class Props {
  state: MainState;
  style?: React.CSSProperties;
}

export class StatusBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const { children, state, style } = this.props;

    return (
      <ConfigContext.Consumer>
        {({ config }) => {
          return (
            <div>
              <StatusBarTemplate
                className="statusBar"
                message={
                  config.statusMessageDisplay ? (
                    <StatusBarMessage state={state} />
                  ) : (
                    ""
                  )
                }
                style={style}
              >
                {children}
              </StatusBarTemplate>
              <StatusBarTemplate
                className={"statusBar_placeholder statusBar"}
                message={
                  config.statusMessageDisplay ? (
                    <StatusBarMessage state={state} id={"placeholder"} />
                  ) : (
                    ""
                  )
                }
                style={style}
              >
                {children}
              </StatusBarTemplate>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
