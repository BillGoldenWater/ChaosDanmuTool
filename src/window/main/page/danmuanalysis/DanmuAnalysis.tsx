import React, { ReactNode } from "react";
import EChartsReact from "echarts-for-react";
import { MessageLog } from "../../../../utils/command/MessageLog";
import { WebsocketClient } from "../../../../utils/client/WebsocketClient";
import { message } from "antd";
import {
  getMessageCommandCmd,
  MessageCommand,
} from "../../../../utils/command/MessageCommand";
import { DanmuMessage } from "../../../../utils/command/DanmuMessage";

class Props {
  httpServerPort: number;
  updatePer: number; //second(s)
}

class State {
  danmuPerSecond: Map<string, number>;
}

export class DanmuAnalysis extends React.Component<Props, State> {
  updateTimer: number;
  history: MessageLog[];
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      danmuPerSecond: new Map<string, number>(),
    };

    this.websocketClient = new WebsocketClient(
      (event: MessageEvent) => this.onMessage(event.data),
      () => null,
      () => null,
      () => message.error("无法接收弹幕信息, 数据可能不会实时更新").then()
    );

    window.setTimeout(this.loadHistory.bind(this), 500);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.updatePer != this.props.updatePer) {
      this.websocketClient.close();
      window.clearInterval(this.updateTimer);

      this.loadHistory();
    }
  }

  componentWillUnmount(): void {
    window.clearInterval(this.updateTimer);
  }

  loadHistory(): void {
    this.setState((prevState) => {
      const done = message.info("正在加载历史弹幕中");
      this.history = window.electron.getDanmuHistory();
      const danmuPerSecond = new Map<string, number>();
      const state = { ...prevState, danmuPerSecond: danmuPerSecond };

      // 如果历史弹幕为空
      if (this.history == null || this.history.length == 0) {
        done();
        message.success(`加载了 0 条弹幕`).then();
        this.doneLoad();
        return state;
      }

      // 初始化中间所有的时间
      const startTs = Math.round(this.history[0].data.timestamp / 1000);
      const endTs = Math.round(this.history.at(-1).data.timestamp / 1000);
      for (let i = startTs; i <= endTs; i++) {
        this.updateNumber(state, this.formatDate(new Date(i * 1000)));
      }

      // 统计历史弹幕
      let danmuCount = 0;
      this.history.forEach((value) => {
        const cmd = value.data.message as MessageCommand;
        if (cmd.cmd != getMessageCommandCmd()) return;

        const danmuMsg: DanmuMessage = JSON.parse(cmd.data);
        if (danmuMsg.cmd != "DANMU_MSG") return;

        const ts = new Date(value.data.timestamp);
        this.updateNumber(state, this.formatDate(ts), 1);
        danmuCount++;
      });

      done();
      message.success(`加载了 ${danmuCount} 条弹幕`).then();
      this.doneLoad();
      return state;
    });
  }

  doneLoad(): void {
    this.websocketClient.connect("localhost", this.props.httpServerPort);
    this.updateTimer = window.setInterval(this.update.bind(this), 500);
  }

  update(): void {
    const date = this.formatDate(new Date());
    if (!this.state.danmuPerSecond.get(date)) {
      this.setState((prevState) => {
        return this.updateNumber(prevState, date);
      });
    }
  }

  updateNumber(state: State, date: string, num?: number): State {
    const s = state;
    const value = s.danmuPerSecond.get(date);
    if (value != null && num != null) {
      s.danmuPerSecond.set(date, value + num);
    } else if (num != null) {
      s.danmuPerSecond.set(date, num);
    } else {
      s.danmuPerSecond.set(date, 0);
    }
    return state;
  }

  onMessage(data: string): void {
    const cmd: MessageCommand = JSON.parse(data);
    if (cmd.cmd != getMessageCommandCmd()) return;

    const danmuMsg: DanmuMessage = JSON.parse(cmd.data);
    if (danmuMsg.cmd != "DANMU_MSG") return;
    if (danmuMsg.info == null) return;

    this.setState((prevState) => {
      const date = this.formatDate(new Date());
      return this.updateNumber(prevState, date, 1);
    });
  }

  render(): ReactNode {
    const s = this.state;

    const option = {
      xAxis: {
        type: "category",
        data: Array.from(s.danmuPerSecond.keys()),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: Array.from(s.danmuPerSecond.values()),
          type: "bar",
        },
      ],
      tooltip: {
        trigger: "axis",
      },
      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          filterMode: "none",
        },
        {
          type: "inside",
          xAxisIndex: 0,
          filterMode: "none",
        },
      ],
    };
    return <EChartsReact option={option} />;
  }

  formatDate(date: Date): string {
    const updatePer = Math.max(this.props.updatePer, 1);
    const mergedTime =
      Math.floor(date.getTime() / 1000 / updatePer) * updatePer * 1000;
    const mergedDate = new Date(mergedTime);

    const month = mergedDate.getMonth();
    const date_ = mergedDate.getDate();
    const hours = mergedDate.getHours();
    const minutes = mergedDate.getMinutes();
    const seconds = mergedDate.getSeconds();
    const monthStr = month.toString(10).padStart(2, "0");
    const dateStr = date_.toString(10).padStart(2, "0");
    const hoursStr = hours.toString(10).padStart(2, "0");
    const minutesStr = minutes.toString(10).padStart(2, "0");
    const secondsStr = seconds.toString(10).padStart(2, "0");

    return `${monthStr}-${dateStr} ${hoursStr}:${minutesStr}:${secondsStr}`;
  }
}
