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
import { TSendGift } from "../../../../type/TSendGift";
import { ConfigContext } from "../../utils/ConfigContext";

class Props {
  httpServerPort: number;
  updatePer: number; //second(s)
}

type MessageCount = {
  danmu: number;
  gift: number;
  freeGift: number;
  paidGift: number;
};

class State {
  danmuMsgCount: Map<string, MessageCount>;
}

export class DanmuAnalysis extends React.Component<Props, State> {
  updateTimer: number;
  history: MessageLog[];
  websocketClient: WebsocketClient;

  constructor(props: Props) {
    super(props);

    this.state = {
      danmuMsgCount: new Map<string, MessageCount>(),
    };

    this.websocketClient = new WebsocketClient(
      (event: MessageEvent) => this.onMessage(event.data),
      () => null,
      () => null,
      () => message.error("无法接收弹幕信息, 数据可能不会实时更新").then()
    );

    window.setTimeout(this.load.bind(this), 500);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.updatePer != this.props.updatePer) {
      this.reload();
    }
  }

  componentWillUnmount(): void {
    this.unload();
  }

  async load(): Promise<void> {
    const done = message.info("正在加载历史弹幕中");
    const dc = new Map<string, MessageCount>();
    const state: State = { ...this.state, danmuMsgCount: dc };
    this.history = window.electron.getDanmuHistory();

    console.log(state);
    // 如果历史弹幕为空
    if (this.history == null || this.history.length == 0) {
      done();
      message.success(`加载了 0 条记录`).then();
      this.doneLoad(state);
      return;
    }

    // 初始化中间所有的时间
    const startTs = Math.round(this.history[0].data.timestamp / 1000);
    const endTs = Math.round(this.history.at(-1).data.timestamp / 1000);
    for (let i = startTs; i <= endTs; i++) {
      this.newItem(state, this.formatDate(new Date(i * 1000)));
    }

    // 统计历史弹幕
    this.history.forEach((value) => {
      const cmd = value.data.message as MessageCommand;
      this.newMessage(state, cmd, new Date(value.data.timestamp));
    });

    done();
    message.success(`加载了 ${this.history.length} 条记录`).then();
    this.doneLoad(state);
  }

  doneLoad(state: State): void {
    this.setState(state);
    this.websocketClient.connect("localhost", this.props.httpServerPort);
    this.updateTimer = window.setInterval(this.update.bind(this), 500);
  }

  update(): void {
    const date = this.formatDate(new Date());
    if (!this.state.danmuMsgCount.get(date)) {
      this.setState((prevState) => {
        return this.newItem(prevState, date);
      });
    }
  }

  unload(): void {
    this.websocketClient.close();
    window.clearInterval(this.updateTimer);
  }

  reload(): void {
    this.unload();
    this.load().then();
    return;
  }

  newItem(
    state: State,
    date: string,
    name?: keyof MessageCount,
    num?: number
  ): State {
    const msgCount = state.danmuMsgCount;
    let count = msgCount.get(date);

    if (count == null) {
      msgCount.set(date, {
        danmu: 0,
        gift: 0,
        freeGift: 0,
        paidGift: 0,
      });
      count = msgCount.get(date);
    }

    if (name != null && num != null) {
      count[name] += num;
    }

    return { ...state, danmuMsgCount: msgCount };
  }

  newMessage(state: State, cmd: MessageCommand, date: Date): State {
    if (cmd.cmd != getMessageCommandCmd()) return;

    const danmuMessage: DanmuMessage = JSON.parse(cmd.data);
    const dateStr = this.formatDate(date);

    switch (danmuMessage.cmd) {
      case "DANMU_MSG": {
        if (danmuMessage.info == null) return;
        return this.newItem(state, dateStr, "danmu", 1);
      }
      case "SEND_GIFT": {
        const gift = danmuMessage as TSendGift;
        this.newItem(state, dateStr, "gift", gift.data.num);

        switch (gift.data.coin_type) {
          case "silver": {
            return this.newItem(state, dateStr, "freeGift", gift.data.num);
          }
          case "gold": {
            return this.newItem(state, dateStr, "paidGift", gift.data.num);
          }
        }
      }
    }
  }

  onMessage(data: string): void {
    this.setState((prevState) => {
      return this.newMessage(prevState, JSON.parse(data), new Date());
    });
  }

  getDanmuCountOption(darkTheme: boolean): unknown {
    const s = this.state;

    const danmuMsgCountValues = Array.from(s.danmuMsgCount.values());
    const danmuMsgCountDanmu: number[] = [];
    const danmuMsgCountGift: number[] = [];
    const danmuMsgCountFreeGift: number[] = [];
    const danmuMsgCountPaidGift: number[] = [];

    danmuMsgCountValues.forEach((value) => {
      danmuMsgCountDanmu.push(value.danmu);
      danmuMsgCountGift.push(value.gift);
      danmuMsgCountFreeGift.push(value.freeGift);
      danmuMsgCountPaidGift.push(value.paidGift);
    });

    return {
      xAxis: {
        type: "category",
        data: Array.from(s.danmuMsgCount.keys()),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "弹幕",
          data: danmuMsgCountDanmu,
          type: "line",
        },
        {
          name: "礼物",
          data: danmuMsgCountGift,
          type: "line",
        },
        {
          name: "免费礼物",
          data: danmuMsgCountFreeGift,
          type: "line",
        },
        {
          name: "付费礼物",
          data: danmuMsgCountPaidGift,
          type: "line",
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
      textStyle: {
        color: darkTheme ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
      },
    };
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ get }) => (
          <EChartsReact
            option={this.getDanmuCountOption(get("darkTheme") as boolean)}
            style={{ width: "99%" }}
          />
        )}
      </ConfigContext.Consumer>
    );
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
