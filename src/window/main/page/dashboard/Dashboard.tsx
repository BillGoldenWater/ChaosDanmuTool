import React, { ReactNode } from "react";
import { ConnectRoom } from "../connectroom/ConnectRoom";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";
import { Divider } from "antd";
import { DanmuViewerSwitch } from "../danmuviewercontrol/DanmuViewerControl";
import { DanmuAnalysis } from "../danmuanalysis/DanmuAnalysis";
import { ConfigItem } from "../../../../component/configitem/ConfigItem";

class Props {
  receiverStatus: ReceiverStatus;
  httpServerPort: number;
}

class State {
  updatePer: number;
}

export class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      updatePer: 30,
    };
  }

  render(): ReactNode {
    const p = this.props;
    const s = this.state;

    return (
      <div>
        <ConnectRoom receiverStatus={p.receiverStatus} />
        <Divider />
        <DanmuViewerSwitch />
        <Divider orientation={"left"}>统计</Divider>
        <ConfigItem
          type={"number"}
          value={s.updatePer}
          setNumber={(value) => {
            this.setState({
              updatePer: value,
            });
          }}
          name={"统计间隔"}
          min={1}
          description={
            <div>
              单位:秒
              <br />
              建议使用整数
            </div>
          }
        />
        <DanmuAnalysis
          httpServerPort={p.httpServerPort}
          updatePer={s.updatePer}
        />
      </div>
    );
  }
}
