import { Config } from "../../../utils/config/Config";
import {
  getStatusUpdateMessageCmd,
  ReceiverStatusUpdate,
} from "../../../utils/command/ReceiverStatusUpdate";
import React, { ReactNode } from "react";
import { ConfigContext } from "../utils/ConfigContext";
import {
  ConfigUpdate,
  getConfigUpdateCmd,
} from "../../../utils/command/ConfigUpdate";
import { WebsocketClient } from "../../../utils/client/WebsocketClient";
import { ConfigProvider, Layout, Menu, notification } from "antd";
import {
  AppstoreOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import SubMenu from "antd/lib/menu/SubMenu";

const { Sider, Content } = Layout;

class Props {}

class State {
  config: Config;
  siderCollapsed: boolean;
}

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: JSON.parse(window.electron.getConfig()),
      siderCollapsed: true,
    };

    this.websocketClient = new WebsocketClient(
      this.onMessage.bind(this),
      () => {
        notification.success({
          message: "连接服务器成功",
          description: "已连接到指令转发服务器",
        });
      },
      () => {
        notification.warn({
          message: "已断开服务器连接",
          description: "已断开到指令转发服务器的连接",
        });
      },
      () => {
        notification.error({
          message: "服务器连接发生错误",
          description: `到指令转发服务器的连接发生了错误`,
        });
      }
    );

    this.websocketClient.connect(
      "localhost",
      this.state.config.danmuViewConfig.httpServerPort
    );
  }

  onMessage(event: MessageEvent): void {
    const msgObj = JSON.parse(event.data);

    switch (msgObj.cmd) {
      case getStatusUpdateMessageCmd(): {
        const msg: ReceiverStatusUpdate = msgObj;
        switch (msg.data.status) {
          case "open": {
            notification.success({
              message: "直播间连接状态更新",
              description: "当前状态为: 已连接",
            });
            break;
          }
          case "close": {
            notification.warn({
              message: "直播间连接状态更新",
              description: "当前状态为: 已断开",
            });
            break;
          }
          case "error": {
            notification.error({
              message: "直播间连接状态更新",
              description: "当前状态为: 发生了错误",
            });
            break;
          }
        }
        break;
      }
      case getConfigUpdateCmd(): {
        const msg: ConfigUpdate = msgObj;
        this.setState({
          config: msg.data,
        });
        break;
      }
      default: {
        console.log(msgObj);
        break;
      }
    }
  }

  render(): ReactNode {
    const state = this.state;

    const configContext = {
      config: this.state.config,
      setConfig: (config: Config) => {
        this.setState({
          config: config,
        });
        window.electron.updateConfig(JSON.stringify(config));
      },
    };

    return (
      <ConfigContext.Provider value={configContext}>
        <ConfigProvider>
          <Layout>
            <Sider
              collapsible={true}
              collapsedWidth={"4em"}
              collapsed={state.siderCollapsed}
              theme={"light"}
              onMouseEnter={() => {
                this.setState({ siderCollapsed: false });
              }}
              onMouseLeave={() => {
                this.setState({ siderCollapsed: true });
              }}
              onCollapse={(collapsed) => {
                this.setState({ siderCollapsed: collapsed });
              }}
            >
              <Menu mode={"inline"}>
                <SubMenu
                  key={"functionList"}
                  icon={<AppstoreOutlined />}
                  title={"功能"}
                >
                  <Menu.Item>功能1</Menu.Item>
                  <Menu.Item>功能2</Menu.Item>
                </SubMenu>
                <Menu.Item key={"danmuHistory"} icon={<HistoryOutlined />}>
                  弹幕历史记录
                </Menu.Item>
                <Menu.Item key={"settings"} icon={<SettingOutlined />}>
                  设置
                </Menu.Item>
              </Menu>
            </Sider>
            <Content style={{ minHeight: "100vh" }}>Content</Content>
          </Layout>
        </ConfigProvider>
      </ConfigContext.Provider>
    );
  }
}
