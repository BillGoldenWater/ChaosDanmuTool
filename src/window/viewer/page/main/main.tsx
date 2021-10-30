import React, { ReactNode } from "react";
import style from "./main.module.css";
import {
  Config,
  DanmuViewCustomConfig,
  defaultConfig,
  defaultDanmuViewCustom,
} from "../../../../utils/config/Config";
import { WebsocketClient } from "../../../../utils/client/WebsocketClient";
import { getParam } from "../../utils/UrlParamGeter";
import { LoadingPage } from "./loadingpage/LoadingPage";
import { ConnectFail } from "./connectfail/ConnectFail";
import { getConfigUpdateCmd } from "../../../../utils/command/ConfigUpdate";
import { getMessageCommandCmd } from "../../../../utils/command/MessageCommand";
import {
  ActivityUpdate,
  getActivityUpdateMessageCmd,
} from "../../../../utils/command/ActivityUpdate";
import {
  DanmuMessage,
  DanmuMessageWithKey,
} from "../../../../utils/command/DanmuMessage";
import {
  InteractWord as TInteractWord,
  InteractWordType,
} from "../../../../model/InteractWord";
import { ConfigContext } from "../../utils/ConfigContext";
import { StatusBar } from "../../../../component/statusbar/StatusBar";
import { DanmuRender } from "./danmurender/DanmuRender";
import { InteractWord } from "./danmurender/danmuitem/item/interactword/InteractWord";
import { formatNumber } from "../../../../utils/FormatConverters";
import { RoomRealTimeMessageUpdate } from "../../../../model/RoomRealTimeMessageUpdate";
import {
  GiftConfig,
  GiftConfigResponse,
  parseGiftConfig,
} from "../../../../model/giftconfig/GiftConfig";
import { getGiftConfigUpdateCmd } from "../../../../utils/command/GiftConfigUpdate";
import { SendGift } from "../../../../model/SendGift";

class Props {}

class State {
  config: DanmuViewCustomConfig;
  danmuList: DanmuMessageWithKey[];
  connectState: "open" | "close" | "error";
  connectAttemptNumber: number;
  activity: number;
  fansNumber: number;
  statusMessage: string | ReactNode;
  giftConfig: GiftConfig;
}

export class Main extends React.Component<Props, State> {
  websocketClient: WebsocketClient;
  maxAttemptNumber: number;
  serverAddress: string;
  serverPort: number;
  reconnectId: number;
  danmuCount: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      config: defaultDanmuViewCustom,
      danmuList: [],
      connectState: "close",
      connectAttemptNumber: 0,
      activity: 0,
      fansNumber: 0,
      statusMessage: "",
      giftConfig: undefined,
    };

    this.serverAddress = getParam("address");
    this.serverPort = parseInt(getParam("port"));
    this.maxAttemptNumber =
      parseInt(getParam("maxReconnectAttemptNum")) ||
      defaultConfig.danmuViewConfig.maxReconnectAttemptNumber;

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
  }

  tryReconnect(): void {
    window.clearInterval(this.reconnectId);
    this.reconnectId = window.setInterval(() => {
      if (this.state.connectAttemptNumber >= this.maxAttemptNumber) return;
      this.websocketClient.connect(this.serverAddress, this.serverPort);
      this.setState((prevState) => {
        return {
          ...prevState,
          connectAttemptNumber: prevState.connectAttemptNumber + 1,
        };
      });
      window.clearInterval(this.reconnectId);
    }, 500);
  }

  processCommand(commandStr: string): void {
    const command = JSON.parse(commandStr);

    switch (command.cmd) {
      case getConfigUpdateCmd(): {
        const config: Config = command.data;

        for (const i in config.danmuViewCustoms) {
          const viewConfig = config.danmuViewCustoms[i];
          if (viewConfig.name == getParam("name")) {
            this.setState({
              config: viewConfig,
            });
          }
        }
        break;
      }
      case getGiftConfigUpdateCmd(): {
        const giftConfig: GiftConfigResponse = command.data;
        this.setState({ giftConfig: parseGiftConfig(giftConfig) });
        break;
      }
      case getActivityUpdateMessageCmd(): {
        const cmd: ActivityUpdate = command;
        this.setState({
          activity: cmd.data.activity,
        });
        break;
      }
      case getMessageCommandCmd(): {
        const msg: DanmuMessage = JSON.parse(command.data);
        switch (msg.cmd) {
          case "INTERACT_WORD": {
            this.processInteractWord(msg.data as TInteractWord);
            break;
          }
          case "DANMU_MSG": {
            this.addToList(msg);
            break;
          }
          case "SEND_GIFT": {
            this.processSendGift(msg as SendGift);
            break;
          }
          case "ROOM_BLOCK_MSG": {
            this.addToList(msg);
            break;
          }
          case "SUPER_CHAT_MESSAGE": {
            this.addToList(msg);
            break;
          }
          case "ROOM_REAL_TIME_MESSAGE_UPDATE": {
            this.processRoomRealTimeMessageUpdate(
              msg as RoomRealTimeMessageUpdate
            );
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

  processSendGift(sendGift: SendGift): void {
    const needRemove: number[] = [];
    let totalNum = 0;

    for (const i in this.state.danmuList) {
      const msg: DanmuMessage = this.state.danmuList[i].msg;
      const key: number = this.state.danmuList[i].key;
      if (msg.cmd == "SEND_GIFT") {
        const sgData = (msg as SendGift).data;
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
      } as SendGift,
      needRemove
    );
  }

  processRoomRealTimeMessageUpdate(
    roomRealTimeMessageUpdate: RoomRealTimeMessageUpdate
  ): void {
    this.setState({
      fansNumber: roomRealTimeMessageUpdate.data.fans,
    });
  }

  processInteractWord(interactWord: TInteractWord): void {
    switch (interactWord.msg_type) {
      case InteractWordType.join: {
        this.setState({
          statusMessage: (
            <InteractWord msg={{ ...interactWord, cmd: "INTERACT_WORD" }} />
          ),
        });
        break;
      }
      default: {
        this.addToList({
          ...interactWord,
          cmd: "INTERACT_WORD",
        } as DanmuMessage);
        break;
      }
    }
  }

  addToList(msg: DanmuMessage, removeKeys?: number[]): void {
    this.setState((prevState) => {
      const list: DanmuMessageWithKey[] = prevState.danmuList;
      list.push({
        key: this.danmuCount,
        msg: msg,
      });
      this.danmuCount++;

      while (
        list.length > 0 &&
        list.length > this.state.config.maxDanmuNumber
      ) {
        list.shift();
      }

      return {
        ...prevState,
        danmuList: list.filter((element) => {
          return removeKeys ? !removeKeys.includes(element.key) : true;
        }),
      };
    });
  }

  render(): JSX.Element {
    return (
      <div className={style.main} style={this.state.config.style.mainStyle}>
        <ConfigContext.Provider
          value={{
            config: this.state.config,
            giftConfig: this.state.giftConfig,
          }}
        >
          {this.state.connectState == "open" &&
            this.state.config.statusBarDisplay && (
              <StatusBar
                message={this.state.statusMessage}
                style={{
                  backgroundColor:
                    this.state.config.style.mainStyle.backgroundColor,
                  borderColor:
                    this.state.config.style.mainStyle.backgroundColor,
                  color: this.state.config.style.mainStyle.color,
                }}
              >
                <div>
                  人气:
                  {this.state.config.numberFormat.formatActivity
                    ? formatNumber(this.state.activity)
                    : this.state.activity}
                </div>
                <div>
                  粉丝数:
                  {this.state.config.numberFormat.formatFansNum
                    ? formatNumber(this.state.fansNumber)
                    : this.state.fansNumber}
                </div>
              </StatusBar>
            )}
          <DanmuRender danmuList={this.state.danmuList} />
        </ConfigContext.Provider>
        {this.state.connectState != "open" &&
          this.state.connectAttemptNumber < this.maxAttemptNumber && (
            <LoadingPage
              action={"连接中"}
              description={"尝试次数: " + this.state.connectAttemptNumber}
            />
          )}
        {this.state.connectAttemptNumber >= this.maxAttemptNumber && (
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
        )}
      </div>
    );
  }
}
