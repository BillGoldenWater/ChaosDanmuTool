/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { MouseEventHandler, ReactNode } from "react";
import "./FunctionInfo.less";
import { FunctionPageInfo, FunctionPageKey } from "./FunctionPage";

class Props {
  info: FunctionPageInfo<FunctionPageKey>;

  onClick?: MouseEventHandler<HTMLDivElement>;
}

export class FunctionInfo extends React.Component<Props> {
  render(): ReactNode {
    const { info, onClick } = this.props;

    return (
      <div className={"FunctionInfo"} onClick={onClick}>
        <div className={"FunctionInfoIcon"}>{info.icon}</div>
        <div className={"FunctionInfoInfo"}>
          <div className={"FunctionInfoName"}>{info.name}</div>
          <div className={"FunctionInfoDescription"}>{info.description}</div>
        </div>
      </div>
    );
  }
}
