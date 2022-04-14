/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./main.css";
import {
  Config,
  DanmuViewCustomConfig,
  defaultViewCustomInternalUUID,
  getDefaultConfig,
  getDefaultDanmuViewCustomConfig,
} from "../../../utils/config/Config";
import { WebsocketClient } from "../../../utils/client/WebsocketClient";
import { getParam } from "../utils/UrlParamGeter";
import { LoadingPage } from "./loadingpage/LoadingPage";
import { ConnectFail } from "./connectfail/ConnectFail";
import { getConfigUpdateCmd } from "../../../command/ConfigUpdate";
import { getMessageCommandCmd } from "../../../command/MessageCommand";
import {
  ActivityUpdate,
  getActivityUpdateMessageCmd,
} from "../../../command/ActivityUpdate";
import {
  DanmuMessageWithKey,
  TBiliBiliDanmuContent,
} from "../../../type/bilibili/TBiliBiliDanmuContent";
import {
  InteractWordType,
  TInteractWord as TInteractWord,
} from "../../../type/bilibili/TInteractWord";
import { ConfigContext } from "../utils/ConfigContext";
import { StatusBar } from "../../../component/statusbar/StatusBar";
import { DanmuRender } from "./danmurender/DanmuRender";
import { InteractWord } from "./danmurender/danmuitem/item/interactword/InteractWord";
import { formatNumber } from "../../../utils/FormatConverters";
import { TRoomRealTimeMessageUpdate } from "../../../type/bilibili/TRoomRealTimeMessageUpdate";
import {
  parseGiftConfig,
  TGiftConfig,
  TGiftConfigResponse,
} from "../../../type/bilibili/giftconfig/TGiftConfig";
import { getGiftConfigUpdateCmd } from "../../../command/GiftConfigUpdate";
import { TSendGift } from "../../../type/bilibili/TSendGift";
import { getStatusUpdateMessageCmd } from "../../../command/ReceiverStatusUpdate";
import { TSuperChatMessage } from "../../../type/bilibili/TSuperChatMessage";
import { parseDanmuMsg, TDanmuMsg } from "../../../type/bilibili/TDanmuMsg";
import { TextToSpeech } from "../utils/TextToSpeech";
import { MessageLog } from "../../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../../type/TAnyMessage";
import { TWatchedChange } from "../../../type/bilibili/TWatchedChange";

class Props {}

type StatusMessageListener = (node: ReactNode) => void;

export class MainState {
  config: DanmuViewCustomConfig;
  danmuList: DanmuMessageWithKey[];
  connectState: "open" | "close" | "error";
  connectAttemptNumber: number;
  activity: number;
  watched: number;
  fansNumber: number;
  giftConfig: TGiftConfig;
  selectable: boolean;

  addMessageListener: (id: string, listener: StatusMessageListener) => void;
  removeMessageListener: (id: string) => void;
}

export class Main extends React.Component<Props, MainState> {
  websocketClient: WebsocketClient;
  tts: TextToSpeech;
  maxAttemptNumber: number;
  infiniteAttempt: boolean;
  serverAddress: string;
  serverPort: number;
  reconnectId: number;
  danmuCount: number;

  statusMessageListeners: Map<string, StatusMessageListener> = new Map();

  constructor(props: Props) {
    super(props);

    this.state = {
      config: getDefaultDanmuViewCustomConfig(),
      danmuList: [],
      connectState: "close",
      connectAttemptNumber: 0,
      activity: -1,
      watched: -1,
      fansNumber: -1,
      giftConfig: undefined,
      selectable: false,

      addMessageListener: (id, listener) => {
        this.statusMessageListeners.set(id, listener);
      },
      removeMessageListener: (id) => {
        this.statusMessageListeners.delete(id);
      },
    };

    this.serverAddress = window.location.hostname;
    this.serverPort = parseInt(getParam("port"));
    this.maxAttemptNumber =
      parseInt(getParam("maxReconnectAttemptNum")) ||
      getDefaultConfig().danmuViewConfig.maxReconnectAttemptNumber;
    this.infiniteAttempt = this.maxAttemptNumber == -1;

    if (!this.serverPort) {
      this.serverPort = parseInt(window.location.port);
    }

    this.danmuCount = 0;

    this.websocketClient = new WebsocketClient(
      (event) => {
        this.processCommand(event.data);
      },
      () => {
        this.setState({
          connectState: "open",
        });
        this.setState({
          connectAttemptNumber: 0,
        });
      },
      () => {
        this.setState({
          connectState: "close",
        });
        this.tryReconnect();
      },
      () => {
        this.setState({
          connectState: "error",
        });
        this.tryReconnect();
      }
    );

    this.websocketClient.connect(this.serverAddress, this.serverPort);

    this.tts = new TextToSpeech();

    window.addEventListener("keydown", (e) => {
      if (e.code == "AltLeft" || e.code == "AltRight") {
        this.setState({
          selectable: true,
        });
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.code == "AltLeft" || e.code == "AltRight") {
        this.setState({
          selectable: false,
        });
      }
    });
  }

  tryReconnect(): void {
    window.clearTimeout(this.reconnectId); // 清除之前的计时器 防止同时运行
    this.reconnectId = window.setTimeout(
      () => {
        if (!this.infiniteAttempt) {
          // 非无限尝试时
          // 如果当前尝试次数达到最大次数
          if (this.state.connectAttemptNumber >= this.maxAttemptNumber) {
            return;
          }
        }

        this.websocketClient.connect(this.serverAddress, this.serverPort); // 连接

        // 更新当前尝试次数
        this.setState((prevState) => {
          return {
            ...prevState,
            connectAttemptNumber: prevState.connectAttemptNumber + 1,
          };
        });
      },
      this.infiniteAttempt ? 1000 : 500 // 如果小于0 每秒一次 否则0.5秒一次
    );
  }

  processCommand(commandStr: string): void {
    const msgLog: MessageLog<TAnyMessage> = JSON.parse(commandStr);
    const anyMsg: TAnyMessage = msgLog.message;

    switch (anyMsg.cmd) {
      case getConfigUpdateCmd(): {
        const config: Config = anyMsg.data;
        const uuid = getParam("uuid");
        let viewConfig: DanmuViewCustomConfig = null;
        let defaultViewConfig: DanmuViewCustomConfig = null;

        config.danmuViewCustoms.forEach((value) => {
          if (value.uuid === uuid) {
            viewConfig = value;
          } else if (value.uuid === defaultViewCustomInternalUUID) {
            defaultViewConfig = value;
          }
        });

        if (viewConfig == null) {
          viewConfig = defaultViewConfig;
        }

        if (viewConfig == null) {
          viewConfig = getDefaultDanmuViewCustomConfig();
        }

        this.setState({
          config: viewConfig,
        });

        this.tts.updateConfig(viewConfig.tts);
        break;
      }
      case getGiftConfigUpdateCmd(): {
        const giftConfig: TGiftConfigResponse = anyMsg.data;
        this.setState({ giftConfig: parseGiftConfig(giftConfig) });
        break;
      }
      case getActivityUpdateMessageCmd(): {
        const cmd: ActivityUpdate = anyMsg;
        this.setState({
          activity: cmd.activity,
        });
        break;
      }
      case getStatusUpdateMessageCmd(): {
        this.addToList(anyMsg);
        break;
      }
      case getMessageCommandCmd(): {
        const msg: TBiliBiliDanmuContent = anyMsg.data;
        switch (msg.cmd) {
          case "WATCHED_CHANGE": {
            this.setState({ watched: (msg as TWatchedChange).data.num });
            break;
          }
          case "INTERACT_WORD": {
            this.processInteractWord(msg as TInteractWord);
            break;
          }
          case "SEND_GIFT": {
            this.processSendGift(msg as TSendGift);
            break;
          }
          case "ROOM_REAL_TIME_MESSAGE_UPDATE": {
            this.processRoomRealTimeMessageUpdate(
              msg as TRoomRealTimeMessageUpdate
            );
            break;
          }
          case "DANMU_MSG": {
            const danmuMsg = parseDanmuMsg(msg);
            !danmuMsg.data.isHistory && this.tts.speakDanmu(danmuMsg);
            this.processDanmuMsg(danmuMsg);
            break;
          }
          case "SUPER_CHAT_MESSAGE":
          case "ROOM_BLOCK_MSG":
          case "LIVE":
          case "PREPARING":
          case "GUARD_BUY":
          case "WARNING":
          case "CUT_OFF": {
            this.addToList(msg);
            break;
          }
          case "STOP_LIVE_ROOM_LIST": //ignore
          case "COMBO_SEND":
          case "COMMON_NOTICE_DANMAKU":
          case "LIVE_INTERACTIVE_GAME":
          case "NOTICE_MSG":
          case "ROOM_CHANGE":
          case "USER_TOAST_MSG":
          case "WIDGET_BANNER":
          case "PK_BATTLE_END":
          case "PK_BATTLE_ENTRANCE":
          case "PK_BATTLE_FINAL_PROCESS":
          case "PK_BATTLE_PRE":
          case "PK_BATTLE_PRE_NEW":
          case "PK_BATTLE_PROCESS":
          case "PK_BATTLE_PROCESS_NEW":
          case "PK_BATTLE_SETTLE":
          case "PK_BATTLE_SETTLE_USER":
          case "PK_BATTLE_SETTLE_V2":
          case "PK_BATTLE_START":
          case "PK_BATTLE_START_NEW":
          case "ONLINE_RANK_COUNT":
          case "ONLINE_RANK_TOP3":
          case "ONLINE_RANK_V2":
          case "ENTRY_EFFECT":
          case "ANCHOR_LOT_AWARD":
          case "ANCHOR_LOT_CHECKSTATUS":
          case "ANCHOR_LOT_END":
          case "ANCHOR_LOT_START":
          case "HOT_RANK_CHANGED":
          case "HOT_RANK_SETTLEMENT": {
            break;
          }
          default: {
            console.log("未知的消息: ");
            console.log(msg);
            break;
          }
        }
        break;
      }
    }
  }

  processDanmuMsg(danmuMsg: TDanmuMsg): void {
    const danmuList = this.state.danmuList;

    let count = 0;
    const needRemove: number[] = danmuList
      .filter((value) => {
        if (value.msg.cmd !== "DANMU_MSG") return false; // 是弹幕
        const dm = parseDanmuMsg(value.msg);
        if (dm.data.content !== danmuMsg.data.content) return false; // 相同内容
        if (danmuMsg.data.timestamp - dm.data.timestamp > 120 * 1e3)
          return false; // 2分钟内

        count += dm.data.count;
        return true;
      })
      .map((value) => value.key);

    if (
      this.state.config.danmuMergeMinNum === -1 ||
      count + 1 < this.state.config.danmuMergeMinNum
    ) {
      this.addToList(danmuMsg);
      return;
    }
    danmuMsg.data.count += count;

    this.addToList(danmuMsg, needRemove);
  }

  processSendGift(sendGift: TSendGift): void {
    const needRemove: number[] = [];
    let totalNum = 0;

    for (const i in this.state.danmuList) {
      const msg: TBiliBiliDanmuContent = this.state.danmuList[i].msg;
      const key: number = this.state.danmuList[i].key;
      if (msg.cmd == "SEND_GIFT") {
        const sgData = (msg as TSendGift).data;
        if (
          sgData.uid == sendGift.data.uid &&
          sgData.giftId == sendGift.data.giftId &&
          sendGift.data.timestamp - sgData.timestamp <=
            sendGift.data.combo_stay_time
        ) {
          needRemove.push(key);
          totalNum += sgData.num;
        }
      }
    }

    this.addToList(
      {
        ...sendGift,
        data: { ...sendGift.data, num: sendGift.data.num + totalNum },
      } as TSendGift,
      needRemove
    );
  }

  processRoomRealTimeMessageUpdate(
    roomRealTimeMessageUpdate: TRoomRealTimeMessageUpdate
  ): void {
    this.setState({
      fansNumber: roomRealTimeMessageUpdate.data.fans,
    });
  }

  processInteractWord(interactWord: TInteractWord): void {
    switch (interactWord.data.msg_type) {
      case InteractWordType.join: {
        Array.from(this.statusMessageListeners.values()).forEach((value) => {
          try {
            value(<InteractWord interactWord={interactWord} />);
          } catch (e) {
            console.error(
              `Main.processInteractWord.callEvent\n${e.name}\n${e.message}\n${e.stack}`
            );
          }
        });
        break;
      }
      default: {
        this.addToList({
          ...interactWord,
          cmd: "INTERACT_WORD",
        } as TBiliBiliDanmuContent);
        break;
      }
    }
  }

  addToList(msg: TBiliBiliDanmuContent, removeKeys?: number[]): void {
    this.setState((prevState) => {
      let list: DanmuMessageWithKey[] = prevState.danmuList;
      list.push({
        key: this.danmuCount,
        msg: msg,
      });
      this.danmuCount++;

      list = list.filter((element, index, array) => {
        let needKeep = false;

        switch (element.msg.cmd) {
          case "SUPER_CHAT_MESSAGE": {
            const superChatMessage: TSuperChatMessage =
              element.msg as TSuperChatMessage;
            needKeep =
              superChatMessage.data.end_time > new Date().getTime() / 1000;
            break;
          }
        }

        return (
          index + 1 > array.length - this.state.config.maxDanmuNumber ||
          needKeep
        );
      }); // 移除超出上限的

      list = list.filter((element) => {
        return removeKeys ? !removeKeys.includes(element.key) : true;
      }); // 移除 removeKeys 里指定的

      return {
        ...prevState,
        danmuList: list,
      };
    });
  }

  render(): JSX.Element {
    const s = this.state;
    let status = null;

    if (s.connectState == "open") {
      if (s.config.statusBarDisplay) {
        status = (
          <StatusBar
            state={s}
            style={{
              color: s.config.style.mainStyle.color,
            }}
          >
            <div>
              {s.config.numberFormat.formatWatched
                ? formatNumber(s.watched)
                : `${s.watched} `}
              人看过
            </div>
            <div>
              人气:{" "}
              {s.config.numberFormat.formatActivity
                ? formatNumber(s.activity)
                : s.activity}
            </div>
            <div>
              粉丝数:{" "}
              {s.config.numberFormat.formatFansNum
                ? formatNumber(s.fansNumber)
                : s.fansNumber}
            </div>
          </StatusBar>
        );
      }
    } else {
      if (
        s.connectAttemptNumber < this.maxAttemptNumber ||
        this.infiniteAttempt
      ) {
        status = (
          <LoadingPage
            action={"连接中"}
            description={"尝试次数: " + s.connectAttemptNumber}
          />
        );
      } else {
        status = (
          <ConnectFail
            connectMethod={() => {
              this.setState((prevState) => {
                return {
                  ...prevState,
                  connectAttemptNumber: 0,
                };
              });
              this.tryReconnect();
            }}
          />
        );
      }
    }

    return (
      <div
        className={"main" + (s.selectable ? " main_selectable" : "")}
        style={s.config.style.mainStyle}
      >
        <ConfigContext.Provider
          value={{
            config: s.config,
            giftConfig: s.giftConfig,
            state: this.state,
          }}
        >
          {status}
          <DanmuRender danmuList={s.danmuList} />
        </ConfigContext.Provider>
      </div>
    );
  }
}
