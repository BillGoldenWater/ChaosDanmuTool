/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./CutOff.less";
import { TCutOff } from "../../../../../../../type/bilibili/admin/TCutOff";

class Props {
  cutOff: TCutOff;
}

export class CutOff extends React.Component<Props> {
  render() {
    const {
      cutOff: { msg },
    } = this.props;
    return <div className={"CutOff"}>当前直播被直播管理员切断; {msg}</div>;
  }
}
