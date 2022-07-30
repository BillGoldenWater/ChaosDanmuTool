/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";

class Props {}

class State {}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    // noinspection HtmlUnknownBooleanAttribute
    return (
      <div
        data-tauri-drag-region
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#aaa1",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span>viewer_window</span>
      </div>
    );
  }
}
