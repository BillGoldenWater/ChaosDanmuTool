/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Button } from "../../../../../rendererShare/component/button/Button";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";
import { SecondaryText } from "../../../../../rendererShare/component/secondaryText/SecondaryText";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";
import { TitleText } from "../../../../../rendererShare/component/titleText/TitleText";
import { DanmuViewerLinkGenerator } from "./DanmuViewerLinkGenerator";

class Props {}

class State {}

export class DanmuViewerManager extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    return (
      <ConfigC>
        {({ get }) => {
          return (
            <div>
              <div>
                <TitleText>在弹幕悬浮窗中查看弹幕:</TitleText>
                <Spacer vertical />
                <div>
                  弹幕悬浮窗:
                  <Spacer half />
                  <Button onClick={window.electron.openViewer}>打开</Button>
                  <Spacer half />
                  <Button onClick={window.electron.closeViewer}>关闭</Button>
                </div>
              </div>
              <Spacer vertical />
              <Spacer vertical />
              <div>
                <TitleText>在其他应用中查看弹幕:</TitleText>
                <Spacer vertical />
                <SecondaryText>
                  选择你想使用的配置后复制链接至其他应用中
                </SecondaryText>
                <Spacer vertical half />
                <SecondaryText>
                  OBS: 添加浏览器源后将链接复制至URL栏中,
                  删除自定义CSS中的所有内容
                  <br />
                  修改大小请使用属性内的高度和宽度,
                  不要直接在预览中拖动或使用变换, 否则可能会导致奇怪的效果
                </SecondaryText>
                <Spacer vertical half />
                <SecondaryText>浏览器: 直接像网页一样打开即可</SecondaryText>
                <Spacer vertical half />
                <SecondaryText>
                  <>
                    注: 在其他设备中使用时需要将链接中的 localhost
                    替换为本机的ip地址, 确保防火墙中放行端口{" "}
                    {get("httpServerPort")}
                  </>
                </SecondaryText>
              </div>
              <Spacer vertical />
              <DanmuViewerLinkGenerator />
            </div>
          );
        }}
      </ConfigC>
    );
  }
}
