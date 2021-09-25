import React from "react";
import { Button } from "../../../../../component/button/Button";
import { Config } from "../../../../../utils/Config";
import { WebsocketClient } from "../../../utils/WebsocketClient";

class Props {
  config: Config;
  websocketClient: WebsocketClient;
}

export class ServerManager extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <Button
          onClick={() => {
            window.electron.runWebsocketServer(
              this.props.config.danmuViewConfig.websocketServer.host,
              this.props.config.danmuViewConfig.websocketServer.port
            );
          }}
        >
          启动服务器
        </Button>
        <Button
          onClick={() => {
            window.electron.closeWebsocketServer();
          }}
        >
          关闭服务器
        </Button>
        <br />
        <Button
          onClick={() => {
            this.props.websocketClient.connect(
              this.props.config.danmuViewConfig.websocketServer.host &&
                this.props.config.danmuViewConfig.websocketServer.host != ""
                ? this.props.config.danmuViewConfig.websocketServer.host
                : "localhost",
              this.props.config.danmuViewConfig.websocketServer.port
            );
          }}
        >
          连接服务器
        </Button>
        <Button
          onClick={() => {
            this.props.websocketClient.close();
          }}
        >
          断开服务器
        </Button>
      </div>
    );
  }
}
