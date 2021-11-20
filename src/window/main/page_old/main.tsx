import React from "react";
import { NavBar } from "../../../component/navbar/NavBar";
import { Function } from "./function/Function";
import { Document } from "./document";
import { Setting } from "./setting/Setting";
import { WebsocketClient } from "../../../utils/client/WebsocketClient";
import {
  getStatusUpdateMessageCmd,
  ReceiverStatus,
  ReceiverStatusUpdate,
} from "../../../utils/command/ReceiverStatusUpdate";
import { Config } from "../../../utils/config/Config";
import { ConfigContext } from "../utils/ConfigContext";
import {
  ConfigUpdate,
  getConfigUpdateCmd,
} from "../../../utils/command/ConfigUpdate";
import { StatusBar } from "../../../component/statusbar/StatusBar";
import { ReceiverStatusIndicator } from "../../../component/receiverstatusindicator/ReceiverStatusIndicator";
import { DateFormat } from "../../../utils/DateFormat";

class Props {}

class State {
  pageIndex: number;
  config: Config;
  receiverStatus: ReceiverStatus;
  statusMessage: string;
}

class Page {
  name: string;
  pageClass: typeof React.Component;
}

const pages: Page[] = [
  { name: "文档", pageClass: Document },
  { name: "功能", pageClass: Function },
  { name: "设置", pageClass: Setting },
];

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);
    this.state = {
      pageIndex: 1,
      config: JSON.parse(window.electron.getConfig()),
      receiverStatus: "close",
      statusMessage: "",
    };

    this.websocketClient = new WebsocketClient(
      this.onMessage.bind(this),
      () => {
        this.setState({
          statusMessage: DateFormat() + " 服务器已连接",
        });
      },
      () => {
        this.setState({
          statusMessage: DateFormat() + " 服务器已断开 ",
        });
      },
      () => {
        this.setState({
          statusMessage: DateFormat() + " 服务器连接发生错误 已断开",
        });
      }
    );

    this.websocketClient.connect("localhost", this.state.config.httpServerPort);
  }

  render(): JSX.Element {
    const CurrentPage = pages[this.state.pageIndex].pageClass;

    return (
      <div>
        <ConfigContext.Provider
          value={{
            config: this.state.config,
            setConfig: (config: Config) => {
              this.setState({
                config: config,
              });
              window.electron.updateConfig(JSON.stringify(config));
            },
          }}
        >
          <NavBar
            items={pages.map((value: Page) => {
              return value.name;
            })}
            default={this.state.pageIndex}
            onSwitch={this.onPageSwitch.bind(this)}
          />
          <CurrentPage
            receiverStatus={this.state.receiverStatus}
            websocketClient={this.websocketClient}
          />
          <StatusBar message={this.state.statusMessage}>
            <ReceiverStatusIndicator status={this.state.receiverStatus} />
          </StatusBar>
        </ConfigContext.Provider>
      </div>
    );
  }

  onMessage(event: MessageEvent): void {
    const msgObj = JSON.parse(event.data);
    console.log(msgObj);

    switch (msgObj.cmd) {
      case getStatusUpdateMessageCmd(): {
        const msg: ReceiverStatusUpdate = msgObj;
        this.setState({
          receiverStatus: msg.data.status,
        });
        break;
      }
      case getConfigUpdateCmd(): {
        const msg: ConfigUpdate = msgObj;
        this.setState({
          config: msg.data,
        });
        break;
      }
    }
  }

  onPageSwitch(index: number): void {
    this.setState({ pageIndex: index });
  }
}
