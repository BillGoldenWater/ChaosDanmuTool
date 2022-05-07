/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";
import { Content } from "../../../component/content/Content";
import { Input } from "../../../component/input/Input";
import { Button } from "../../../component/button/Button";

class Props {}

class State {}

export class ConnectRoom extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    return (
      <ConfigC>
        {({ state }) => {
          const { config } = state;

          return (
            <Content>
              房间号:{" "}
              <Input
                type={"number"}
                defaultValue={config.danmuReceiver.roomid}
              />
              <Button
                primary
                style={{
                  marginLeft: "0.5em",
                }}
                // onClick={() => alert("test")}
              >
                连 接
              </Button>
            </Content>
          );
        }}
      </ConfigC>
    );
  }
}
