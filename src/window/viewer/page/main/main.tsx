import React from "react";
import { Config, defaultConfig } from "../../../../utils/Config";
import { WebsocketClient } from "../../../../utils/client/WebsocketClient";
import { getParam } from "../../utils/UrlParamGeter";
import { LoadingPage } from "./loadingpage/LoadingPage";
import { ConnectFail } from "./connectfail/ConnectFail";

class Props {}

class State {
  config: Config;
  danmuList: [];
  connectState: "open" | "close" | "error";
  connectAttemptNumber: number;
}

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;
  maxAttemptNumber: number;
  serverAddress: string;
  serverPort: number;
  reconnectId: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: defaultConfig,
      danmuList: [],
      connectState: "close",
      connectAttemptNumber: 5,
    };

    this.serverAddress = getParam("address");
    this.serverPort = parseInt(getParam("port"));
    this.maxAttemptNumber =
      parseInt(getParam("maxReconnectAttemptNum")) ||
      defaultConfig.danmuViewConfig.maxReconnectAttemptNumber;

    this.websocketClient = new WebsocketClient(
      this.processCommand.bind(this),
      () => {
        this.setState({
          connectState: "open",
        });
        this.setState({
          connectAttemptNumber: 0,
        });
      },
      () => {
        this.setState({
          connectState: "close",
        });
        this.tryReconnect();
      },
      () => {
        this.setState({
          connectState: "error",
        });
        this.tryReconnect();
      }
    );

    this.websocketClient.connect(this.serverAddress, this.serverPort);
  }

  tryReconnect(): void {
    window.clearInterval(this.reconnectId);
    this.reconnectId = window.setInterval(() => {
      if (this.state.connectAttemptNumber >= this.maxAttemptNumber) return;
      this.websocketClient.connect(this.serverAddress, this.serverPort);
      this.setState((prevState) => {
        return {
          ...prevState,
          connectAttemptNumber: prevState.connectAttemptNumber + 1,
        };
      });
      window.clearInterval(this.reconnectId);
    }, 500);
  }

  processCommand(commandStr: string): void {
    const command = JSON.parse(commandStr);
    console.log(command);
  }

  render(): JSX.Element {
    return (
      <div>
        {getParam("port")}
        {this.state.connectState != "open" &&
          this.state.connectAttemptNumber < this.maxAttemptNumber && (
            <LoadingPage
              action={"连接中"}
              description={"尝试次数: " + this.state.connectAttemptNumber}
            />
          )}
        {this.state.connectAttemptNumber >= this.maxAttemptNumber && (
          <ConnectFail
            connectMethod={() => {
              this.setState((prevState) => {
                return {
                  ...prevState,
                  connectAttemptNumber: 0,
                };
              });
              this.tryReconnect();
            }}
          />
        )}
      </div>
    );
  }
}
