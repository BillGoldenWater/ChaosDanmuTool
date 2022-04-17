/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigContext, TConfigContext } from "../../../../utils/ConfigContext";
import { Button, Collapse, Space } from "antd";
import { getDefaultConfig } from "../../../../../../utils/config/Config";
import { ConfigItem } from "../../../../../../component/configitem/ConfigItem";

export class DanmuViewConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ get, set }) => {
          const dDvc = getDefaultConfig().danmuViewConfig;
          const dvcGet = (key: string, defaultValue: unknown) => {
            return get(`danmuViewConfig.${key}`, defaultValue);
          };
          const dvcSet = (key: string, value: unknown) => {
            set(`danmuViewConfig.${key}`, value);
          };
          const dvcContext: TConfigContext = {
            get: dvcGet,
            set: dvcSet,
            updateConfig: null,
          };

          const drcGet = (key: string, defaultValue: unknown) => {
            return get(`danmuReceiver.${key}`, defaultValue);
          };
          const drcSet = (key: string, value: unknown) => {
            set(`danmuReceiver.${key}`, value);
          };
          const drcContext: TConfigContext = {
            get: drcGet,
            set: drcSet,
            updateConfig: null,
          };

          return (
            <div>
              <ConfigItem
                configContext={drcContext}
                type={"number"}
                valueKey={"heartBeatInterval"}
                min={1}
                max={70}
                name={"心跳包间隔"}
                description={
                  <div>
                    单位为秒
                    <br />
                    用于维持与B站的连接 同时也是人气更新间隔
                  </div>
                }
              />

              <ConfigItem
                configContext={dvcContext}
                type={"number"}
                valueKey={"maxReconnectAttemptNumber"}
                min={-1}
                name={"最大重连次数"}
                description={
                  <div>
                    当弹幕查看器 无法连接到应用 或 断开连接 后尝试连接的最大次数
                    <br />
                    设置为-1为无限尝试 间隔1秒
                  </div>
                }
              />

              <Collapse>
                <Collapse.Panel
                  key={"danmuViewer"}
                  header={"弹幕查看器悬浮窗设置"}
                >
                  <ConfigItem
                    configContext={dvcContext}
                    type={"boolean"}
                    valueKey={"autoOpenWhenConnect"}
                    name={"在连接直播间时自动打开"}
                  />
                  <Space>
                    <Button
                      onClick={() => {
                        dvcSet("posX", dDvc.posX);
                        dvcSet("posY", dDvc.posY);
                      }}
                    >
                      重置位置
                    </Button>
                    <Button
                      onClick={() => {
                        dvcSet("width", dDvc.width);
                        dvcSet("height", dDvc.height);
                      }}
                    >
                      重置大小
                    </Button>
                  </Space>
                </Collapse.Panel>
                <Collapse.Panel key={"advanced"} header={"高级"}>
                  <ConfigItem
                    configContext={drcContext}
                    type={"string"}
                    valueKey={"serverUrl"}
                    name={"B站弹幕服务器url"}
                  />
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
