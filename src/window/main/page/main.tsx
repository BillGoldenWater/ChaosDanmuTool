import React from "react";
import { NavBar } from "../../../component/navbar/NavBar";
import { Function } from "./function/Function";
import { Document } from "./document";
import { Setting } from "./setting";
import { WebsocketClient } from "../utils/WebsocketClient";
import {
  getStatusUpdateMessageCmd,
  ReceiverStatus,
  ReceiverStatusUpdate,
} from "../../../utils/command/ReceiverStatusUpdate";
import { Config, defaultConfig } from "../../../utils/Config";
import {
  ConfigUpdate,
  getConfigUpdateCmd,
} from "../../../utils/command/ConfigUpdate";

class Props {}

class State {
  pageIndex: number;
  receiverStatus: ReceiverStatus;
  config: Config;
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
      receiverStatus: "close",
      config: { ...defaultConfig },
    };

    this.websocketClient = new WebsocketClient(this.onMessage.bind(this));
  }

  render(): JSX.Element {
    const CurrentPage = pages[this.state.pageIndex].pageClass;
    return (
      <div>
        <NavBar
          items={pages.map((value: Page) => {
            return value.name;
          })}
          default={this.state.pageIndex}
          onSwitch={this.onPageSwitch.bind(this)}
        />
        <CurrentPage />
      </div>
    );
  }

  onMessage(event: MessageEvent): void {
    const msgObj = JSON.parse(event.data);

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
