import React, { ReactNode } from "react";
import { ConnectRoom } from "../connectroom/ConnectRoom";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";
import { Divider } from "antd";
import { DanmuViewerSwitch } from "../danmuviewercontrol/DanmuViewerControl";
import { MessageLog } from "../../../../utils/command/MessageLog";
import EChartsReact from "echarts-for-react";
import { MessageCommand } from "../../../../utils/command/MessageCommand";
import { DanmuMessage } from "../../../../utils/command/DanmuMessage";

class Props {
  receiverStatus: ReceiverStatus;
}

class State {
  danmuHistory: MessageLog[];
}

export class Dashboard extends React.Component<Props, State> {
  refreshTimer: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      danmuHistory: [],
    };

    this.refreshTimer = window.setInterval(() => {
      const result = window.electron.getDanmuHistory();
      if (result) {
        this.setState({
          danmuHistory: result,
        });
      }
    }, 1000);
  }

  componentWillUnmount(): void {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
    }
  }

  render(): ReactNode {
    const p = this.props;

    const danmuPerSecond: {
      [key: string]: number;
    } = {};

    this.state.danmuHistory.forEach((value) => {
      const msg = value.data.message as MessageCommand;
      const ts = value.data.timestamp;

      if (msg.cmd != "messageCommand") return;
      const danmuMsg: DanmuMessage = JSON.parse(msg.data);
      if (danmuMsg.cmd != "DANMU_MSG") return;
      const date = new Date(ts);
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} 
      ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

      if (danmuPerSecond[dateStr]) {
        danmuPerSecond[dateStr] += 1;
      } else {
        danmuPerSecond[dateStr] = 1;
      }
    });

    const keys = [];
    const values = [];

    for (const time in danmuPerSecond) {
      keys.push(time);
      values.push(danmuPerSecond[time]);
    }

    const option = {
      xAxis: {
        type: "category",
        data: keys,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: values,
          type: "line",
          smooth: true,
        },
      ],
      tooltip: {
        trigger: "axis",
      },
    };

    return (
      <div>
        <ConnectRoom receiverStatus={p.receiverStatus} />
        <Divider />
        <DanmuViewerSwitch />
        <EChartsReact option={option} />
      </div>
    );
  }
}
