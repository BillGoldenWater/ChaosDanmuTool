/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConnectRoom } from "../connectroom/ConnectRoom";
import { ReceiverStatus } from "../../../../command/ReceiverStatusUpdate";
import { Divider } from "antd";
import { DanmuViewerSwitch } from "../danmuviewercontrol/DanmuViewerControl";

class Props {
  receiverStatus: ReceiverStatus;
  httpServerPort: number;
}

export class Dashboard extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mergePer: 30,
    };
  }

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
