/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {ReactNode} from "react";
import "./Sider.less";

class Props {
}

export class Sider extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): ReactNode {
    const {children} = this.props;

    return <div className={"Sider"}>{children}</div>;
  }
}
