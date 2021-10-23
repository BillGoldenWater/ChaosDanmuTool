import React from "react";
import { Config, defaultConfig } from "../../../utils/Config";
import { WebsocketClient } from "../../../utils/client/WebsocketClient";
import { getParam } from "../utils/UrlParamGeter";

class Props {}

class State {
  config: Config;
  danmuList: [];
  connectState: "open" | "close" | "error";
}

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: defaultConfig,
      danmuList: [],
      connectState: "close",
    };

    this.websocketClient = new WebsocketClient(
      this.processCommand.bind(this),
      () => {
        this.setState({
          connectState: "open",
        });
      },
      () => {
        this.setState({
          connectState: "close",
        });
      },
      () => {
        this.setState({
          connectState: "error",
        });
      }
    );
  }

  processCommand(commandStr: string): void {
    const command = JSON.parse(commandStr);
    console.log(command);
  }

  render(): JSX.Element {
    return (
      <div>
        {getParam("port")}
        {/*<LoadingPage action={"连接中"} />*/}
      </div>
    );
  }
}
