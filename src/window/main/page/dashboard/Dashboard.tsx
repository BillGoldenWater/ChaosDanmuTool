import React, { ReactNode } from "react";
import { ConnectRoom } from "../connectroom/ConnectRoom";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";
import { Divider } from "antd";
import { DanmuViewerSwitch } from "../danmuviewercontrol/DanmuViewerControl";

class Props {
  receiverStatus: ReceiverStatus;
}

export class Dashboard extends React.Component<Props> {
  render(): ReactNode {
    const p = this.props;

    return (
      <div>
        <ConnectRoom receiverStatus={p.receiverStatus} />
        <Divider />
        <DanmuViewerSwitch />
      </div>
    );
  }
}
