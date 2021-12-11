import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import {
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Popover,
  Space,
  Switch,
} from "antd";
import {
  DanmuReceiverConfig,
  DanmuViewConfig,
  getDefaultConfig,
} from "../../../../../../utils/config/Config";
import { QuestionCircleOutlined } from "@ant-design/icons";

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
              <Form.Item label={"心跳包间隔"}>
                <Space>
                  <InputNumber
                    min={1}
                    max={70}
                    defaultValue={drc.heartBeatInterval}
                    onChange={(value) => {
                      setDrc({ ...drc, heartBeatInterval: value });
                    }}
                  />
                  <Popover
                    content={
                      <div>
                        单位为秒
                        <br />
                        用于维持与B站的连接 同时也是人气更新间隔
                      </div>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Form.Item label={"最大重连次数"}>
                <Space>
                  <InputNumber
                    min={1}
                    defaultValue={dvc.maxReconnectAttemptNumber}
                    onChange={(value) => {
                      setDvc({ ...dvc, maxReconnectAttemptNumber: value });
                    }}
                  />
                  <Popover
                    content={
                      <div>
                        当弹幕查看器 无法连接到应用 或 断开连接
                        后尝试连接的最大次数
                      </div>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Collapse>
                <Collapse.Panel
                  key={"danmuViewer"}
                  header={"弹幕查看器悬浮窗设置"}
                >
                  <Form.Item label={"在连接直播间时自动打开"}>
                    <Switch
                      checked={dvc.autoOpenWhenConnect}
                      onChange={(value) => {
                        setDvc({ ...dvc, autoOpenWhenConnect: value });
                      }}
                    />
                  </Form.Item>
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
                  <Form.Item label={"B站弹幕服务器url"}>
                    <Input
                      value={drc.serverUrl}
                      onChange={(event) => {
                        setDrc({ ...drc, serverUrl: event.target.value });
                      }}
                    />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
