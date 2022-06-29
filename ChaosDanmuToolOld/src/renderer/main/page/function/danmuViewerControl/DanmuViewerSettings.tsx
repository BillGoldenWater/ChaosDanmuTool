/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";
import { ConfigItem } from "../../../../../rendererShare/component/configItem/ConfigItem";
import { TitleText } from "../../../../../rendererShare/component/titleText/TitleText";

export class DanmuViewerSettings extends React.Component {
  render(): ReactNode {
    return (
      <ConfigC>
        {(context) => {
          return (
            <div>
              <TitleText>功能设置:</TitleText>
              <Spacer vertical />
              <ConfigItem
                context={context}
                path={"danmuViewConfig.autoOpenWhenConnect"}
                type={"boolean"}
                name={"连接时打开"}
                description={"在连接直播间时自动打开弹幕悬浮窗"}
              />
              <Spacer vertical half />
              <ConfigItem
                context={context}
                path={"danmuReceiver.heartBeatInterval"}
                type={"number"}
                name={"人气更新间隔"}
                description={"单位: 秒"}
                max={60}
              />
            </div>
          );
        }}
      </ConfigC>
    );
  }
}
