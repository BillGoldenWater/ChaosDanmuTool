/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Content.less";

class Props {
  padding?: boolean;
}

export class Content extends React.Component<Props> {
  render(): ReactNode {
    const { children, padding } = this.props;
    const paddingClass = padding ? ` ContentPadding` : "";

    return <div className={`Content${paddingClass}`}>{children}</div>;
  }
}
