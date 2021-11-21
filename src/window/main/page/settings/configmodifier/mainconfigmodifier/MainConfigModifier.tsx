import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import {
  Alert,
  Collapse,
  Form,
  InputNumber,
  Popover,
  Space,
  Switch,
} from "antd";
import { MacCommandOutlined, QuestionCircleOutlined } from "@ant-design/icons";

export class MainConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const cfg = config;
          return (
            <div>
              <Form.Item label={"黑暗主题"}>
                <Space>
                  <Switch
                    checked={cfg.darkTheme}
                    onChange={(value) => {
                      setConfig({ ...cfg, darkTheme: value });
                    }}
                  />
                  <Popover
                    content={
                      <div>
                        主题切换出现问题时请按下 Ctrl+R (macOS 为{" "}
                        <MacCommandOutlined />
                        +R) 重新加载
                      </div>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Popover>
                </Space>
              </Form.Item>

              <Collapse>
                <Collapse.Panel
                  key={"autoSave"}
                  header={"配置文件自动保存设置"}
                >
                  <Form.Item label={"退出时"}>
                    <Space>
                      <Switch
                        checked={cfg.autoSaveOnQuit}
                        onChange={(value) => {
                          setConfig({ ...cfg, autoSaveOnQuit: value });
                        }}
                      />
                      <Popover content={<div>退出应用时自动保存配置文件</div>}>
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>

                  <Form.Item label={"更改时"}>
                    <Space>
                      <Switch
                        checked={cfg.autoSaveOnChange}
                        onChange={(value) => {
                          setConfig({ ...cfg, autoSaveOnChange: value });
                        }}
                      />
                      <Popover
                        content={<div>每次更改设置时自动保存配置文件</div>}
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel key={"advanced"} header={"高级"}>
                  <Form.Item label={"HTTP服务器监听端口"}>
                    <Space>
                      <InputNumber
                        min={0}
                        defaultValue={cfg.httpServerPort}
                        onChange={(value) => {
                          setConfig({ ...cfg, httpServerPort: value });
                        }}
                      />
                      <Popover
                        content={
                          <div>
                            仅当端口冲突时需要修改(提示: 已断开服务器连接 或
                            服务器连接发生错误)
                          </div>
                        }
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </Space>
                  </Form.Item>
                  <Alert
                    type={"warning"}
                    message={"修改后需要重新打开以应用设置"}
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
