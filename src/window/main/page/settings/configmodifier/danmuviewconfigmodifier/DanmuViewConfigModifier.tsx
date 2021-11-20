import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import { Button, Form, InputNumber, Space } from "antd";
import {
  DanmuViewConfig,
  defaultConfig,
} from "../../../../../../utils/config/Config";

export class DanmuViewConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const dvc = config.danmuViewConfig;
          const dDvc = defaultConfig.danmuViewConfig;
          const setDvc = (danmuViewConfig: DanmuViewConfig) => {
            setConfig({ ...config, danmuViewConfig: danmuViewConfig });
          };

          return (
            <div>
              <Form.Item label={"最大重连次数"}>
                <InputNumber
                  min={1}
                  defaultValue={dvc.maxReconnectAttemptNumber}
                  onChange={(value) => {
                    setDvc({ ...dvc, maxReconnectAttemptNumber: value });
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
                    setDvc({ ...dvc, width: dDvc.width, height: dDvc.height });
                  }}
                >
                  重置大小
                </Button>
              </Space>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
