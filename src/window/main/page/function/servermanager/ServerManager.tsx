import React from "react";
import { Button } from "../../../../../component/button/Button";
import { Config } from "../../../../../utils/Config";
import { WebsocketClient } from "../../../utils/WebsocketClient";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";

class Props {
  config: Config;
  websocketClient: WebsocketClient;
}

export class ServerManager extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <FunctionCard className={""} name={"指令转发服务器"}>
          <Button
            onClick={() => {
              window.electron.runWebsocketServer(
                this.props.config.danmuViewConfig.websocketServer.host,
                this.props.config.danmuViewConfig.websocketServer.port
              );
            }}
          >
            启动
          </Button>
          <Button
            onClick={() => {
              window.electron.closeWebsocketServer();
            }}
          >
            关闭
          </Button>
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
            连接
          </Button>
          <Button
            onClick={() => {
              this.props.websocketClient.close();
            }}
          >
            断开
          </Button>
        </FunctionCard>
        <FunctionCard className={""} name={"网页服务器"}>
          <Button
            onClick={() => {
              window.electron.runKoaServer(
                this.props.config.danmuViewConfig.webServer.port
              );
            }}
          >
            启动
          </Button>
          <Button
            onClick={() => {
              window.electron.closeKoaServer();
            }}
          >
            关闭
          </Button>
        </FunctionCard>
      </div>
    );
  }
}
