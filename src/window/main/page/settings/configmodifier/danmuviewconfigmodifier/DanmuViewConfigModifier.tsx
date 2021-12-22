import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import { Button, Collapse, Space } from "antd";
import {
  DanmuReceiverConfig,
  DanmuViewConfig,
  getDefaultConfig,
} from "../../../../../../utils/config/Config";
import { ConfigItem } from "../../../../../../component/configitem/ConfigItem";

export class DanmuViewConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const dvc = config.danmuViewConfig;
          const dDvc = getDefaultConfig().danmuViewConfig;
          const setDvc = (danmuViewConfig: DanmuViewConfig) => {
            setConfig({ ...config, danmuViewConfig: danmuViewConfig });
          };

          const drc = config.danmuReceiver;
          const setDrc = (danmuReceiverConfig: DanmuReceiverConfig) => {
            setConfig({ ...config, danmuReceiver: danmuReceiverConfig });
          };

          return (
            <div>
              <ConfigItem
                type={"number"}
                name={"心跳包间隔"}
                description={
                  <div>
                    单位为秒
                    <br />
                    用于维持与B站的连接 同时也是人气更新间隔
                  </div>
                }
                value={drc.heartBeatInterval}
                min={1}
                max={70}
                setNumber={(value) => {
                  setDrc({ ...drc, heartBeatInterval: value });
                }}
              />

              <ConfigItem
                type={"number"}
                name={"最大重连次数"}
                description={
                  <div>
                    当弹幕查看器 无法连接到应用 或 断开连接 后尝试连接的最大次数
                    <br />
                    设置为-1为无限尝试 间隔1秒
                  </div>
                }
                value={dvc.maxReconnectAttemptNumber}
                min={-1}
                setNumber={(value) => {
                  setDvc({ ...dvc, maxReconnectAttemptNumber: value });
                }}
              />

              <Collapse>
                <Collapse.Panel
                  key={"danmuViewer"}
                  header={"弹幕查看器悬浮窗设置"}
                >
                  <ConfigItem
                    type={"boolean"}
                    name={"在连接直播间时自动打开"}
                    value={dvc.autoOpenWhenConnect}
                    setBoolean={(value) => {
                      setDvc({ ...dvc, autoOpenWhenConnect: value });
                    }}
                  />
                  <Space>
                    <Button
                      onClick={() => {
                        setDvc({ ...dvc, posX: dDvc.posX, posY: dDvc.posY });
                      }}
                    >
                      重置位置
                    </Button>
                    <Button
                      onClick={() => {
                        setDvc({
                          ...dvc,
                          width: dDvc.width,
                          height: dDvc.height,
                        });
                      }}
                    >
                      重置大小
                    </Button>
                  </Space>
                </Collapse.Panel>
                <Collapse.Panel key={"advanced"} header={"高级"}>
                  <ConfigItem
                    type={"string"}
                    name={"B站弹幕服务器url"}
                    value={drc.serverUrl}
                    setString={(value) => {
                      setDrc({ ...drc, serverUrl: value });
                    }}
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
