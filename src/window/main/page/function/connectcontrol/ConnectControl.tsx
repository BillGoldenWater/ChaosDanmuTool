import React from "react";
import { Button } from "../../../../../component/button/Button";
import { Config } from "../../../../../utils/Config";
import { ReceiverStatus } from "../../../../../utils/command/ReceiverStatusUpdate";

class Props {
  config: Config;
  setConfig: (config: Config) => void;
  receiverStatus: ReceiverStatus;
}

export class ConnectControl extends React.Component<Props> {
  constructor(props: never) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        <span>房间号: </span>
        <input
          value={
            this.props.config.danmuReceiver.roomid
              ? this.props.config.danmuReceiver.roomid
              : 0
          }
          type={"number"}
          style={{
            padding: "0.3em",
            maxWidth: "10ch",
            marginRight: "0.4em",
          }}
          onChange={(event) => {
            const newConfig: Config = {
              ...this.props.config,
              danmuReceiver: {
                ...this.props.config.danmuReceiver,
                roomid: parseInt(event.target.value),
              },
            };
            this.props.setConfig(newConfig);
          }}
        />
        <Button
          onClick={() => {
            if (this.props.receiverStatus == "open") {
              window.electron.disconnect();
            } else {
              window.electron.connect(this.props.config.danmuReceiver.roomid);
            }
          }}
        >
          {this.props.receiverStatus == "open" ? "断开" : "连接"}
        </Button>
      </div>
    );
  }
}
