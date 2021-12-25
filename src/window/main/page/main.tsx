import React, { ReactNode } from "react";
import style from "./main.module.css";
import { Config } from "../../../utils/config/Config";
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
import {
  Button,
  Card,
  Collapse,
  ConfigProvider,
  Layout,
  Menu,
  message,
  Modal,
  notification,
  Typography,
} from "antd";
import {
  ApiOutlined,
  AppstoreOutlined,
  EyeOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import SubMenu from "antd/lib/menu/SubMenu";
import { ConnectRoom } from "./connectroom/ConnectRoom";
import { DanmuViewerControl } from "./danmuviewercontrol/DanmuViewerControl";
import { Settings } from "./settings/Settings";
import { TGithubReleases } from "../../../type/TGithubReleases";
import { TGithubRelease } from "../../../type/TGithubRelease";
import MarkdownIt from "markdown-it";

const { Sider, Content } = Layout;

class Props {}

type PageKey =
  | "connectRoom"
  | "danmuViewerControl"
  | "settings"
  | "danmuHistory";

class State {
  config: Config;
  siderCollapsed: boolean;
  pageKey: PageKey;
  receiverStatus: ReceiverStatus;
  showUpdate: boolean;
  updateRedirecting: boolean;
  updateDownloadLink: string;
  latestGithubRelease: TGithubRelease;
  changeLog: string;
}

export class Main extends React.Component<Props, State> {
  markdownIt: MarkdownIt;
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: JSON.parse(window.electron.getConfig()),
      siderCollapsed: true,
      pageKey: "connectRoom",
      receiverStatus: "close",
      showUpdate: false,
      updateRedirecting: false,
      updateDownloadLink: "",
      latestGithubRelease: null,
      changeLog: "",
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

    this.markdownIt = new MarkdownIt();

    this.websocketClient.connect("localhost", this.state.config.httpServerPort);
    this.checkUpdate();
  }

  checkUpdate(fromUser?: boolean): void {
    window.electron.checkUpdate().then((hasUpdate: boolean) => {
      if (hasUpdate) {
        window.electron.getChangeLog().then((changeLog: string) => {
          this.setState({
            changeLog: changeLog,
          });
          window.electron
            .getReleasesInfo()
            .then((releasesInfo: TGithubReleases) => {
              const latestRelease = releasesInfo[0];

              if (
                latestRelease.tag_name == this.state.config.update.ignoreVersion
              ) {
                if (!fromUser) {
                  return;
                }
              }

              const assets = latestRelease.assets;
              const platform = window.electron.getPlatform();
              const assetForCurrentPlatform = assets.find((value) => {
                return value.name.includes(platform);
              });
              const link = assetForCurrentPlatform.browser_download_url;

              this.setState({
                showUpdate: hasUpdate,
                updateDownloadLink: link,
                latestGithubRelease: latestRelease,
              });
            });
        });
      } else {
        if (fromUser) {
          message.success("当前已是最新版本").then();
        }
      }
    });
  }

  onMessage(event: MessageEvent): void {
    const msgObj = JSON.parse(event.data);

    switch (msgObj.cmd) {
      case getStatusUpdateMessageCmd(): {
        const msg: ReceiverStatusUpdate = msgObj;

        this.setState({ receiverStatus: msg.data.status });
        switch (msg.data.status) {
          case "open": {
            notification.success({
              message: "直播间连接状态更新",
              description: "当前状态为: 已连接",
              placement: "bottomRight",
            });
            break;
          }
          case "close": {
            notification.warn({
              message: "直播间连接状态更新",
              description: "当前状态为: 未连接",
              placement: "bottomRight",
            });
            break;
          }
          case "error": {
            notification.error({
              message: "直播间连接状态更新",
              description: "当前状态为: 发生了错误",
              placement: "bottomRight",
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

    if (this.state.config.darkTheme) {
      import("./main.dark.module.css");
    } else {
      import("./main.light.module.css");
    }

    const configContext = {
      config: this.state.config,
      setConfig: (config: Config) => {
        this.setState({
          config: config,
        });
        window.electron.updateConfig(JSON.stringify(config));
      },
    };

    let currentPage = null;

    switch (state.pageKey) {
      case "connectRoom": {
        currentPage = (
          <ConnectRoom receiverStatus={this.state.receiverStatus} />
        );
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
    }

    let updateInfo = null;
    if (this.state.showUpdate) {
      updateInfo = (
        <Modal
          title={"新的版本!"}
          visible={this.state.showUpdate}
          closable={false}
          footer={[
            <Button // download
              key={"link"}
              href={this.state.updateDownloadLink}
              type={"primary"}
              loading={this.state.updateRedirecting}
              onClick={() => {
                this.setState({ updateRedirecting: true });
                setTimeout(() => {
                  this.setState({
                    showUpdate: false,
                    updateRedirecting: false,
                  });
                }, 3000);
              }}
            >
              下载
            </Button>,
            <Button // skip
              onClick={() => {
                this.setState({ showUpdate: false });
                configContext.setConfig({
                  ...this.state.config,
                  update: {
                    ...this.state.config.update,
                    ignoreVersion: this.state.latestGithubRelease.tag_name,
                  },
                });
              }}
            >
              跳过此版本
            </Button>,
            <Button // close
              onClick={() => {
                this.setState({ showUpdate: false });
              }}
            >
              关闭
            </Button>,
          ]}
        >
          <Typography.Title level={3}>
            {this.state.latestGithubRelease.name}
          </Typography.Title>
          <Card>
            <div
              dangerouslySetInnerHTML={{
                __html: this.markdownIt.render(
                  this.state.latestGithubRelease.body
                ),
              }}
            />
          </Card>
          <Collapse>
            <Collapse.Panel key={"changeLog"} header={"历史更新记录"}>
              <div
                dangerouslySetInnerHTML={{
                  __html: this.markdownIt.render(this.state.changeLog),
                }}
              />
            </Collapse.Panel>
          </Collapse>
        </Modal>
      );
    }

    return (
      <ConfigContext.Provider value={configContext}>
        <ConfigProvider>
          {updateInfo}
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
