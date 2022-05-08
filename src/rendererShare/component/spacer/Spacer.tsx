/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Spacer.less";

class Props {
  vertical?: boolean;
  half?: boolean;
  quarter?: boolean;
}

export class Spacer extends React.Component<Props> {
  render(): ReactNode {
    const { vertical, half, quarter } = this.props;
    const orientClass = !vertical ? "Spacer" : "SpacerVertical";
    const sizeClass = half ? " SpacerHalf" : quarter ? " SpacerQuarter" : "";

    return <div className={orientClass + sizeClass} />;
  }
}
