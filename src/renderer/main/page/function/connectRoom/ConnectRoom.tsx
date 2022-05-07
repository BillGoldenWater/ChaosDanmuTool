/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Content } from "../../../component/content/Content";
import { Input } from "../../../component/input/Input";

class Props {}

class State {}

export class ConnectRoom extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    return (
      <Content>
        房间号: <Input type={"number"} defaultValue={114514} />
        {/*<button>连接</button>*/}
      </Content>
    );
  }
}
