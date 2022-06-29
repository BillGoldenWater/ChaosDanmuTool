/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";
import { ConfigItem } from "../../../../../rendererShare/component/configItem/ConfigItem";

class Props {}

class State {}

export class ConnectionSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    return (
      <ConfigC>
        {(context) => {
          return (
            <div>
              <ConfigItem
                type={"boolean"}
                name={"自动重连"}
                context={context}
                path={"danmuReceiver.autoReconnect"}
                description={"在异常断开直播间时自动重连, 延迟1秒, 最多尝试5次"}
              />
            </div>
          );
        }}
      </ConfigC>
    );
  }
}
