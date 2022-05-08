/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Layout.less";

class Props {
  sider?: ReactNode;
}

export class Layout extends React.Component<Props> {
  render(): ReactNode {
    const { children, sider } = this.props;

    return (
      <div className={"Layout"}>
        {sider ? <div className={"LayoutSider"}>{sider}</div> : ""}
        <div className={"LayoutContent"}>{children}</div>
      </div>
    );
  }
}
