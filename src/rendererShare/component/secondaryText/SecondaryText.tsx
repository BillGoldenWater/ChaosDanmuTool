/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { PropsWithChildren, ReactNode } from "react";
import "./SecondaryText.less";

class Props {}

export class SecondaryText extends React.Component<PropsWithChildren<Props>> {
  render(): ReactNode {
    const { children } = this.props;

    return <div className={"SecondaryText"}>{children}</div>;
  }
}
