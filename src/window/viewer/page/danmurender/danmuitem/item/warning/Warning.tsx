/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./Warning.less";
import { TWarning } from "../../../../../../../type/bilibili/admin/TWarning";

class Props {
  warning: TWarning;
}

export class Warning extends React.Component<Props> {
  render() {
    const {
      warning: { msg },
    } = this.props;

    return <div className={"Warning"}>{msg}</div>;
  }
}
