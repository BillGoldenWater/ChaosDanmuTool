/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { ConfigContext } from "../../utils/ConfigContext";
import { TBiliBiliDanmuContent } from "../../../../type/bilibili/TBiliBiliDanmuContent";
import {
  InteractWordType,
  TInteractWord,
} from "../../../../type/bilibili/TInteractWord";
import { TWatchedChange } from "../../../../type/bilibili/TWatchedChange";
import { TRoomRealTimeMessageUpdate } from "../../../../type/bilibili/TRoomRealTimeMessageUpdate";
import { TSendGift } from "../../../../type/bilibili/TSendGift";
import EChartsReact from "echarts-for-react";
import { MessageLog } from "../../../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../../../type/TAnyMessage";
import { formatTime } from "../../../../utils/FormatUtils";

class Props {
  mergePer: number;
  danmuHistory: MessageLog<TAnyMessage>[];
}

type MessageCount = {
  danmuMsg: number;
  join: number;
  follow: number;
  share: number;
  gift: number;
  giftFree: number;
  giftPaid: number;
  activity: number;
  watched: number;
  fansNum: number;
};

export type AnalysisItemName =
  | "弹幕"
  | "粉丝数"
  | "看过人数"
  | "人气"
  | "付费礼物"
  | "免费礼物"
  | "礼物"
  | "分享"
  | "关注"
  | "进入";

type GraphItem = {
  name: AnalysisItemName;
  data: number[];
  type: "line";
};

export class DanmuAnalysis extends React.Component<Props> {
  init(
    danmuHistory: MessageLog<TAnyMessage>[],
    msgCount: Map<string, MessageCount>
  ) {
    const dh = danmuHistory;

    if (dh.length > 0) {
      for (
        let i = Math.floor(dh[0].timestamp / 1000);
        i <= Math.floor(dh[dh.length - 1].timestamp / 1000) + 1;
        i++
      ) {
        msgCount.set(this.formatDate(i * 1000), {
          danmuMsg: 0,
          join: 0,
          follow: 0,
          share: 0,
          gift: 0,
          giftFree: 0,
          giftPaid: 0,
          activity: 0,
          watched: 0,
          fansNum: 0,
        });
      }
    }
  }

  analyse(
    danmuHistory: MessageLog<TAnyMessage>[],
    msgCount: Map<string, MessageCount>
  ) {
    const dh = danmuHistory;

    let lastTs = Math.floor(
      dh.length > 0 ? dh[0].timestamp / 1e3 : new Date().getTime() / 1e3
    );

    let activity = 0;
    let watched = 0;
    let fansNum = 0;

    for (const item of dh) {
      const ts = item.timestamp;

      for (let i = lastTs; i <= Math.floor(ts / 1e3) + 1; i++) {
        const count = msgCount.get(this.formatDate(i * 1000));
        count.activity = activity;
        count.watched = watched;
        count.fansNum = fansNum;
      }
      lastTs = Math.floor(ts / 1e3);

      const count = msgCount.get(this.formatDate(ts));
      count.activity = activity;
      count.watched = watched;
      count.fansNum = fansNum;

      if (item.message.cmd === "activityUpdate") {
        activity = item.message.activity;
        count.activity = activity;
      }

      if (item.message.cmd !== "messageCommand") continue;
      const msg = item.message.data as TBiliBiliDanmuContent;

      switch (msg.cmd) {
        case "DANMU_MSG": {
          count.danmuMsg += 1;
          break;
        }
        case "INTERACT_WORD": {
          const cmd = msg as TInteractWord;
          switch (cmd.data.msg_type) {
            case InteractWordType.join: {
              count.join += 1;
              break;
            }
            case InteractWordType.follow: {
              count.follow += 1;
              break;
            }
            case InteractWordType.share: {
              count.share += 1;
              break;
            }
          }
          break;
        }
        case "SEND_GIFT": {
          const cmd = msg as TSendGift;
          count.gift += 1;
          if (cmd.data.coin_type === "silver") count.giftFree += 1;
          if (cmd.data.coin_type === "gold") count.giftPaid += 1;
          break;
        }
        case "WATCHED_CHANGE": {
          const cmd = msg as TWatchedChange;
          watched = cmd.data.num;
          count.watched = watched;
          break;
        }
        case "ROOM_REAL_TIME_MESSAGE_UPDATE": {
          const cmd = msg as TRoomRealTimeMessageUpdate;
          fansNum = cmd.data.fans;
          count.fansNum = fansNum;
          break;
        }
      }
    }
  }

  addItemToGraphItems(
    items: GraphItem[],
    name: AnalysisItemName,
    data: number[]
  ) {
    items.push({
      name: name,
      data: data,
      type: "line",
    });
  }

  toEChartsOption(
    msgCount: Map<string, MessageCount>,
    darkTheme: boolean
  ): unknown[] {
    const msgCountKeys: string[] = [];
    const danmuMsg: number[] = [];
    const join: number[] = [];
    const follow: number[] = [];
    const share: number[] = [];
    const gift: number[] = [];
    const giftFree: number[] = [];
    const giftPaid: number[] = [];
    const activity: number[] = [];
    const watched: number[] = [];
    const fansNum: number[] = [];

    for (const key of Array.from(msgCount.keys())) {
      msgCountKeys.push(key);
      const count = msgCount.get(key);

      danmuMsg.push(count.danmuMsg);
      join.push(count.join);
      follow.push(count.follow);
      share.push(count.share);
      gift.push(count.gift);
      giftFree.push(count.giftFree);
      giftPaid.push(count.giftPaid);
      activity.push(count.activity);
      watched.push(count.watched);
      fansNum.push(count.fansNum);
    }

    const items: GraphItem[] = [];
    this.addItemToGraphItems(items, "弹幕", danmuMsg);
    this.addItemToGraphItems(items, "礼物", gift);
    this.addItemToGraphItems(items, "免费礼物", giftFree);
    this.addItemToGraphItems(items, "付费礼物", giftPaid);

    const items2: GraphItem[] = [];
    this.addItemToGraphItems(items2, "进入", join);
    this.addItemToGraphItems(items2, "关注", follow);
    this.addItemToGraphItems(items2, "分享", share);

    const items3: GraphItem[] = [];
    this.addItemToGraphItems(items3, "人气", activity);
    this.addItemToGraphItems(items3, "看过人数", watched);

    const items4: GraphItem[] = [];
    this.addItemToGraphItems(items4, "粉丝数", fansNum);

    const option = {
      xAxis: {
        type: "category",
        data: msgCountKeys,
      },
      yAxis: {
        type: "value",
      },
      series: items,
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
          type: "slider",
          yAxisIndex: 0,
          filterMode: "none",
        },
      ],
      textStyle: {
        color: darkTheme ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
      },
    };

    return [
      option,
      {
        ...option,
        series: items2,
      },
      {
        ...option,
        series: items3,
      },
      {
        ...option,
        series: items4,
      },
    ];
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ get }) => {
          const dh = this.props.danmuHistory;

          const msgCount = new Map<string, MessageCount>();

          this.init(dh, msgCount);

          this.analyse(dh, msgCount);

          const optionList = this.toEChartsOption(
            msgCount,
            get("darkTheme") as boolean
          );

          return (
            <div>
              <EChartsReact option={optionList[0]} />
              <EChartsReact option={optionList[1]} />
              <EChartsReact option={optionList[2]} />
              <EChartsReact option={optionList[3]} />
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }

  formatDate(ts: number): string {
    const mergePer = Math.max(this.props.mergePer, 1);
    const mergedTime = Math.floor(ts / 1e3 / mergePer) * mergePer * 1e3;
    return formatTime(new Date(mergedTime));
  }
}
