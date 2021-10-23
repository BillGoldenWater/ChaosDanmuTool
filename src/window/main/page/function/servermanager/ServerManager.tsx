import React from "react";
import { Button } from "../../../../../component/button/Button";
import { WebsocketClient } from "../../../../../utils/client/WebsocketClient";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";
import { ConfigContext } from "../../../../../utils/ConfigContext";

class Props {
  websocketClient: WebsocketClient;
}

export class ServerManager extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <div>
            <FunctionCard className={""} name={"指令转发服务器"}>
              <Button
                onClick={() => {
                  window.electron.runWebsocketServer(
                    config.danmuViewConfig.websocketServer.host,
                    config.danmuViewConfig.websocketServer.port
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
                    config.danmuViewConfig.websocketServer.host &&
                      config.danmuViewConfig.websocketServer.host != ""
                      ? config.danmuViewConfig.websocketServer.host
                      : "localhost",
                    config.danmuViewConfig.websocketServer.port
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
                    config.danmuViewConfig.webServer.port
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
        )}
      </ConfigContext.Consumer>
    );
  }
}
