import React from "react";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import style from "./Function.module.css";
import { ConnectControl } from "./connectcontrol/ConnectControl";
import { Config } from "../../../../utils/Config";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";

class Props {
  config: Config;
  setConfig: (config: Config) => void;
  receiverStatus: ReceiverStatus;
}

export class Function extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.function}>
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
