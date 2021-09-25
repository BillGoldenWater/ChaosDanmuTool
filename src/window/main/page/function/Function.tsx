import React from "react";
import style from "./Function.module.css";
import { Config } from "../../../../utils/Config";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import { ConnectControl } from "./connectcontrol/ConnectControl";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";
import { ServerManager } from "./servermanager/ServerManager";
import { WebsocketClient } from "../../utils/WebsocketClient";

class Props {
  config: Config;
  setConfig: (config: Config) => void;
  receiverStatus: ReceiverStatus;
  websocketClient: WebsocketClient;
}

export class Function extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.function}>
        <FunctionCard className={""} name={"服务器管理"}>
          <ServerManager
            config={this.props.config}
            websocketClient={this.props.websocketClient}
          />
        </FunctionCard>
        <FunctionCard className={""} name={"直播间连接"}>
          <ConnectControl
            config={this.props.config}
            setConfig={this.props.setConfig}
            receiverStatus={this.props.receiverStatus}
          />
        </FunctionCard>
      </div>
    );
  }
}
