import React, { ReactNode } from "react";
import style from "./main.module.css";
import { Config } from "../../../utils/config/Config";
import dotProp from "dot-prop";
import {
  getStatusUpdateMessageCmd,
  ReceiverStatus,
  ReceiverStatusUpdate,
} from "../../../utils/command/ReceiverStatusUpdate";
import { ConfigContext } from "../utils/ConfigContext";
import {
  ConfigUpdate,
  getConfigUpdateCmd,
} from "../../../utils/command/ConfigUpdate";
import { WebsocketClient } from "../../../utils/client/WebsocketClient";
import { ConfigProvider, Layout, Menu, notification } from "antd";
import {
  ApiOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  EyeOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import SubMenu from "antd/lib/menu/SubMenu";
import { ConnectRoom } from "./connectroom/ConnectRoom";
import { DanmuViewerControl } from "./danmuviewercontrol/DanmuViewerControl";
import { Settings } from "./settings/Settings";
import { UpdateChecker } from "../utils/UpdateChecker";
import { Dashboard } from "./dashboard/Dashboard";
import { About } from "./about/About";

const { Sider, Content } = Layout;

class Props {}

type PageKey =
  | "dashboard"
  | "connectRoom"
  | "danmuViewerControl"
  | "danmuHistory"
  | "settings"
  | "about";

class State {
  config: Config;
  siderCollapsed: boolean;
  pageKey: PageKey;
  receiverStatus: ReceiverStatus;
  updateInfo: ReactNode;
}

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: window.electron.getConfig(),
      siderCollapsed: true,
      pageKey: "dashboard",
      receiverStatus: "close",
      updateInfo: null,
    };

    this.websocketClient = new WebsocketClient(
      this.onMessage.bind(this),
      () => {
        notification.success({
          message: "连接服务器成功",
          description: "已连接到指令转发服务器",
          placement: "bottomRight",
        });
      },
      () => {
        notification.warn({
          message: "已断开服务器连接",
          description: "已断开到指令转发服务器的连接",
          placement: "bottomRight",
        });
      },
      () => {
        notification.error({
          message: "服务器连接发生错误",
          description: "到指令转发服务器的连接发生了错误",
          placement: "bottomRight",
        });
      }
    );

    this.websocketClient.connect("localhost", this.state.config.httpServerPort);

    UpdateChecker.checkUpdate(this.state.config).then(
      (updateInfo: ReactNode) => {
        this.setState({ updateInfo: updateInfo });
      }
    );
  }

  onMessage(event: MessageEvent): void {
    const msgObj = JSON.parse(event.data);

    switch (msgObj.cmd) {
      case getStatusUpdateMessageCmd(): {
        const msg: ReceiverStatusUpdate = msgObj;

        this.setState({ receiverStatus: msg.data.status });
        let notify = null;
        let statusMsg = "";
        switch (msg.data.status) {
          case "open": {
            notify = notification.success;
            statusMsg = "已连接";
            break;
          }
          case "close": {
            notify = notification.warn;
            statusMsg = "未连接";
            break;
          }
          case "error": {
            notify = notification.error;
            statusMsg = "发生了错误";
            break;
          }
        }

        notify
          ? notify({
              message: "直播间连接状态更新",
              description: `当前状态为: ${statusMsg}`,
              placement: "bottomRight",
            })
          : "";
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

    if (this.state.config.darkTheme) {
      import("./main.dark.module.css");
    } else {
      import("./main.light.module.css");
    }

    const configContext = {
      get: (key: string, defaultValue?: unknown) => {
        return dotProp.get(state.config, key, defaultValue);
      },
      set: (key: string, value: unknown) => {
        this.setState((prevState) => {
          dotProp.set(prevState.config, key, value);
          window.electron.updateConfig(prevState.config);
          return prevState;
        });
      },
      updateConfig: (config: Config) => {
        this.setState({
          config: config,
        });
        window.electron.updateConfig(config);
      },
    };

    let currentPage: ReactNode;

    switch (state.pageKey) {
      case "dashboard": {
        currentPage = <Dashboard receiverStatus={state.receiverStatus} />;
        break;
      }
      case "connectRoom": {
        currentPage = <ConnectRoom receiverStatus={state.receiverStatus} />;
        break;
      }
      case "danmuViewerControl": {
        currentPage = <DanmuViewerControl />;
        break;
      }
      case "settings": {
        currentPage = <Settings />;
        break;
      }
      case "about": {
        currentPage = (
          <About
            checkUpdate={(whenDone) => {
              UpdateChecker.checkUpdate(state.config, true).then(
                (updateInfo: ReactNode) => {
                  this.setState({ updateInfo: updateInfo });
                  whenDone();
                }
              );
            }}
          />
        );
        break;
      }
      default: {
        currentPage = <h3>未完成</h3>;
      }
    }

    return (
      <ConfigContext.Provider value={configContext}>
        <ConfigProvider>
          {state.updateInfo}
          <Layout>
            <Sider
              collapsible={true}
              collapsedWidth={"4em"}
              collapsed={state.siderCollapsed}
              theme={state.config.darkTheme ? "dark" : "light"}
              onCollapse={(collapsed) => {
                this.setState({ siderCollapsed: collapsed });
              }}
            >
              <Menu
                mode={"inline"}
                style={{ userSelect: "none" }}
                onClick={(event) => {
                  this.setState({ pageKey: event.key as PageKey });
                }}
                defaultSelectedKeys={["connectRoom"]}
                theme={state.config.darkTheme ? "dark" : "light"}
              >
                <Menu.Item key={"dashboard"} icon={<DashboardOutlined />}>
                  总览
                </Menu.Item>
                <SubMenu
                  key={"functionList"}
                  icon={<AppstoreOutlined />}
                  title={"功能"}
                >
                  <Menu.Item key={"connectRoom"} icon={<ApiOutlined />}>
                    连接直播间
                  </Menu.Item>
                  <Menu.Item key={"danmuViewerControl"} icon={<EyeOutlined />}>
                    弹幕查看器
                  </Menu.Item>
                </SubMenu>
                <Menu.Item key={"danmuHistory"} icon={<HistoryOutlined />}>
                  弹幕历史记录
                </Menu.Item>
                <Menu.Item key={"settings"} icon={<SettingOutlined />}>
                  设置
                </Menu.Item>
                <Menu.Item key={"about"} icon={<InfoCircleOutlined />}>
                  关于
                </Menu.Item>
              </Menu>
            </Sider>
            <Content style={{ minHeight: "100vh" }}>
              <div
                className={style.main_content}
                style={
                  state.config.darkTheme
                    ? { backgroundColor: "#1f1f1f" }
                    : { backgroundColor: "#fff" }
                }
              >
                {currentPage}
              </div>
            </Content>
          </Layout>
        </ConfigProvider>
      </ConfigContext.Provider>
    );
  }
}
