import React from "react";
import style from "./Function.module.css";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import { ConnectControl } from "./connectcontrol/ConnectControl";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";
import { ServerManager } from "./servermanager/ServerManager";
import { WebsocketClient } from "../../../../utils/client/WebsocketClient";

class Props {
  receiverStatus: ReceiverStatus;
  websocketClient: WebsocketClient;
}

export class Function extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.function}>
        <FunctionCard className={""} name={"服务器管理"}>
          <ServerManager websocketClient={this.props.websocketClient} />
        </FunctionCard>
        <FunctionCard className={""} name={"直播间连接"}>
          <ConnectControl receiverStatus={this.props.receiverStatus} />
        </FunctionCard>
      </div>
    );
  }
}
