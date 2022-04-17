/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./HistoryBrowser.less";
import {
  Button,
  Divider,
  List,
  Modal,
  Popconfirm,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckSquareOutlined,
  DeleteOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  MinusSquareOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { MessageLog } from "../../../../command/messagelog/MessageLog";
import { TAnyMessage } from "../../../../type/TAnyMessage";
import { MessageCommand } from "../../../../command/MessageCommand";
import { parseDanmuMsg } from "../../../../type/bilibili/TDanmuMsg";
import { TSuperChatMessage } from "../../../../type/bilibili/TSuperChatMessage";
import { TGuardBuy } from "../../../../type/bilibili/TGuardBuy";
import {
  InteractWordType,
  TInteractWord,
} from "../../../../type/bilibili/TInteractWord";
import { TRoomBlockMsg } from "../../../../type/bilibili/TRoomBlockMsg";
import { TRoomRealTimeMessageUpdate } from "../../../../type/bilibili/TRoomRealTimeMessageUpdate";
import { TSendGift } from "../../../../type/bilibili/TSendGift";
import { TWatchedChange } from "../../../../type/bilibili/TWatchedChange";
import { TMedalInfo } from "../../../../type/bilibili/userinfo/TMedalInfo";
import { HistoryState } from "./History";
import { ConfigContext } from "../../utils/ConfigContext";
import { ConfigItem } from "../../../../component/configitem/ConfigItem";

class Props {
  state: Readonly<HistoryState>;
  setState: <K extends keyof HistoryState>(
    state:
      | ((
          prevState: Readonly<HistoryState>
        ) => Pick<HistoryState, K> | HistoryState | null)
      | (Pick<HistoryState, K> | HistoryState | null)
  ) => void;
  resetSelectedFile: () => void;
}

class State {
  openFilterModifier: boolean;

  searchValue: string;

  systemMessage: boolean;
  activityUpdate: boolean;
  joinResponse: boolean;
  receiverStatusUpdate: boolean;

  danmuMessage: boolean;
  danmuMsg: boolean;
  live: boolean;
  preparing: boolean;
  superChatMessage: boolean;
  guardBuy: boolean;
  interactWord: boolean;
  roomBlockMsg: boolean;
  roomRealTimeMessageUpdate: boolean;
  sendGift: boolean;
  watchedChange: boolean;
}

export class HistoryBrowser extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      openFilterModifier: false,

      searchValue: "",

      systemMessage: true,
      activityUpdate: true,
      joinResponse: true,
      receiverStatusUpdate: true,

      danmuMessage: true,
      danmuMsg: true,
      live: true,
      preparing: true,
      superChatMessage: true,
      guardBuy: true,
      interactWord: true,
      roomBlockMsg: true,
      roomRealTimeMessageUpdate: true,
      sendGift: true,
      watchedChange: true,
    };
  }

  render() {
    return (
      <ConfigContext.Consumer>
        {({ get }) => {
          const p = this.props;
          const s = this.props.state;
          const f = this.state;

          return (
            <div
              className={
                "HistoryBrowser" +
                (get("darkTheme")
                  ? " HistoryBrowserDark"
                  : " HistoryBrowserLight")
              }
            >
              {/*region filterModifier*/}
              <Modal
                visible={f.openFilterModifier}
                closable={false}
                footer={[
                  <Button
                    key={"close"}
                    onClick={() => {
                      this.setState({ openFilterModifier: false });
                    }}
                  >
                    关闭
                  </Button>,
                ]}
              >
                <div className={"HistoryBrowserSpace"}>
                  <Tooltip title={"全选"}>
                    <Button
                      icon={<CheckSquareOutlined />}
                      onClick={() => {
                        this.setState({
                          systemMessage: true,
                          activityUpdate: true,
                          joinResponse: true,
                          receiverStatusUpdate: true,

                          danmuMessage: true,
                          danmuMsg: true,
                          live: true,
                          preparing: true,
                          superChatMessage: true,
                          guardBuy: true,
                          interactWord: true,
                          roomBlockMsg: true,
                          roomRealTimeMessageUpdate: true,
                          sendGift: true,
                          watchedChange: true,
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={"反选"}>
                    <Button
                      icon={<MinusSquareOutlined />}
                      onClick={() => {
                        this.setState((prevState) => ({
                          systemMessage: !prevState.systemMessage,
                          activityUpdate: !prevState.activityUpdate,
                          joinResponse: !prevState.joinResponse,
                          receiverStatusUpdate: !prevState.receiverStatusUpdate,

                          danmuMessage: !prevState.danmuMessage,
                          danmuMsg: !prevState.danmuMsg,
                          live: !prevState.live,
                          preparing: !prevState.preparing,
                          superChatMessage: !prevState.superChatMessage,
                          guardBuy: !prevState.guardBuy,
                          interactWord: !prevState.interactWord,
                          roomBlockMsg: !prevState.roomBlockMsg,
                          roomRealTimeMessageUpdate:
                            !prevState.roomRealTimeMessageUpdate,
                          sendGift: !prevState.sendGift,
                          watchedChange: !prevState.watchedChange,
                        }));
                      }}
                    />
                  </Tooltip>
                  <ConfigItem
                    type={"boolean"}
                    name={"系统消息"}
                    value={f.systemMessage}
                    setBoolean={(value) => {
                      this.setState({
                        systemMessage: value,
                      });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"互动消息"}
                    value={f.danmuMessage}
                    setBoolean={(value) => {
                      this.setState({
                        danmuMessage: value,
                      });
                    }}
                  />
                </div>
                <Divider>系统消息</Divider>
                <div className={"HistoryBrowserSpace"}>
                  <ConfigItem
                    type={"boolean"}
                    name={"人气更新"}
                    value={f.activityUpdate}
                    setBoolean={(value) => {
                      this.setState({ activityUpdate: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"连接回复"}
                    value={f.joinResponse}
                    setBoolean={(value) => {
                      this.setState({ joinResponse: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"连接状态更新"}
                    value={f.receiverStatusUpdate}
                    setBoolean={(value) => {
                      this.setState({ receiverStatusUpdate: value });
                    }}
                  />
                </div>
                <Divider>互动消息</Divider>
                <div className={"HistoryBrowserSpace"}>
                  <ConfigItem
                    type={"boolean"}
                    name={"弹幕"}
                    value={f.danmuMsg}
                    setBoolean={(value) => {
                      this.setState({ danmuMsg: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"开播消息"}
                    value={f.live}
                    setBoolean={(value) => {
                      this.setState({ live: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"下播消息"}
                    value={f.preparing}
                    setBoolean={(value) => {
                      this.setState({ preparing: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"醒目留言"}
                    value={f.superChatMessage}
                    setBoolean={(value) => {
                      this.setState({ superChatMessage: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"上舰"}
                    value={f.guardBuy}
                    setBoolean={(value) => {
                      this.setState({ guardBuy: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"交互信息"}
                    value={f.interactWord}
                    setBoolean={(value) => {
                      this.setState({ interactWord: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"禁言"}
                    value={f.roomBlockMsg}
                    setBoolean={(value) => {
                      this.setState({ roomBlockMsg: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"房间信息更新"}
                    value={f.roomRealTimeMessageUpdate}
                    setBoolean={(value) => {
                      this.setState({ roomRealTimeMessageUpdate: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"礼物"}
                    value={f.sendGift}
                    setBoolean={(value) => {
                      this.setState({ sendGift: value });
                    }}
                  />
                  <ConfigItem
                    type={"boolean"}
                    name={"看过人数更新"}
                    value={f.watchedChange}
                    setBoolean={(value) => {
                      this.setState({ watchedChange: value });
                    }}
                  />
                </div>
              </Modal>
              {/*endregion*/}
              {/*region fileList*/}
              <List
                bordered
                size={"small"}
                dataSource={s.files}
                className={"HistoryBrowserNoScrollBar"}
                style={{
                  overflow: "auto",
                  minWidth: "26ch",
                }}
                header={
                  <div className={"HistoryBrowserFlexSpace"}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={p.resetSelectedFile}
                    />
                    <Tooltip
                      title={"自动更新 间隔2秒 不推荐在数据量过多时使用"}
                    >
                      <Button
                        icon={<SyncOutlined spin={s.autoReload} />}
                        onClick={() => {
                          p.setState((prevState) => ({
                            autoReload: !prevState.autoReload,
                          }));
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      disabled={s.selectFile === ""}
                      title={`确定要删除 ${this.getNameOnly(
                        s.selectFile
                      )} 吗, 不可撤销`}
                      onConfirm={() => {
                        window.electron.deleteCommandHistoryFile(s.selectFile);
                        p.resetSelectedFile();
                      }}
                    >
                      <Button
                        disabled={s.selectFile === ""}
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                    <Tooltip
                      title={`在 ${
                        window.electron.getPlatform() === "darwin"
                          ? "Finder"
                          : "文件管理器"
                      } 中打开`}
                    >
                      <Button
                        icon={<FolderOpenOutlined />}
                        disabled={s.selectFile === ""}
                        onClick={() => {
                          window.electron.showCommandHistoryFolder(
                            s.selectFile
                          );
                        }}
                      />
                    </Tooltip>
                  </div>
                }
                renderItem={(item) => (
                  <List.Item
                    onClick={() => {
                      p.setState({
                        selectFile: item,
                      });
                      window.electron.getCommandHistory(item).then((value) => {
                        p.setState({
                          commandHistory: value,
                        });
                      });
                    }}
                    style={{ userSelect: "none" }}
                  >
                    <Typography.Text strong={s.selectFile === item}>
                      {this.getNameOnly(item)}
                    </Typography.Text>
                  </List.Item>
                )}
              />
              {/*endregion*/}
              {/*region fileDetail*/}
              <List
                bordered
                size={"small"}
                dataSource={s.commandHistory}
                style={{ overflow: "auto", width: "100%" }}
                header={
                  <div
                    className={"HistoryBrowserSpace HistoryBrowserFlexSpace"}
                    style={{ justifyContent: "space-evenly" }}
                  >
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => {
                        this.setState({ openFilterModifier: true });
                      }}
                    />
                    <ConfigItem
                      type={"string"}
                      name={"搜索"}
                      value={f.searchValue}
                      setString={(value) =>
                        this.setState({ searchValue: value })
                      }
                      description={
                        <div>
                          仅在原始数据中搜索 可能会有偏差
                          <br />
                          推荐用于搜索 用户名/弹幕内容
                        </div>
                      }
                    />
                  </div>
                }
                renderItem={(item: MessageLog<TAnyMessage>) => {
                  if (
                    f.searchValue != "" &&
                    JSON.stringify(item).indexOf(f.searchValue) === -1
                  )
                    return null;

                  if (item.message.cmd == "messageCommand") {
                    if (!f.danmuMessage) return null;

                    const msg = (item.message as MessageCommand).data;

                    switch (msg.cmd) {
                      case "DANMU_MSG": {
                        if (!f.danmuMsg) return null;
                        const data = parseDanmuMsg(msg).data;

                        return (
                          <List.Item>
                            {this.getMedalInfo(data.medalInfo)} {data.uName}:{" "}
                            {data.content}
                          </List.Item>
                        );
                      }
                      case "LIVE": {
                        if (!f.live) return null;
                        return <List.Item>房间状态更新: 直播中</List.Item>;
                      }
                      case "PREPARING": {
                        if (!f.preparing) return null;
                        return <List.Item>房间状态更新: 准备中</List.Item>;
                      }
                      case "SUPER_CHAT_MESSAGE": {
                        if (!f.superChatMessage) return null;
                        const data = (msg as TSuperChatMessage).data;

                        return (
                          <List.Item>
                            {`{醒目留言} `}
                            {data.price}¥ {this.getMedalInfo(data.medal_info)}{" "}
                            {data.user_info.uname}: {data.message}
                          </List.Item>
                        );
                      }
                      case "GUARD_BUY": {
                        if (!f.guardBuy) return null;
                        const data = (msg as TGuardBuy).data;

                        return (
                          <List.Item>
                            {data.username} 购买 {data.gift_name}x
                            {`${data.num} `}
                            {(data.price / 1000).toFixed(2)}¥
                          </List.Item>
                        );
                      }
                      case "INTERACT_WORD": {
                        if (!f.interactWord) return null;
                        const data = (msg as TInteractWord).data;
                        let action = "";

                        switch (data.msg_type) {
                          case InteractWordType.join: {
                            action = "进入了直播间";
                            break;
                          }
                          case InteractWordType.follow: {
                            action = "关注了直播间";
                            break;
                          }
                          case InteractWordType.share: {
                            action = "分享了直播间";
                            break;
                          }
                        }
                        return (
                          <List.Item>
                            {data.uname} {action}
                          </List.Item>
                        );
                      }
                      case "ROOM_BLOCK_MSG": {
                        if (!f.roomBlockMsg) return null;
                        const data = (msg as TRoomBlockMsg).data;
                        return <List.Item>{data.uname} 被管理员封禁</List.Item>;
                      }
                      case "ROOM_REAL_TIME_MESSAGE_UPDATE": {
                        if (!f.roomRealTimeMessageUpdate) return null;
                        const data = (msg as TRoomRealTimeMessageUpdate).data;

                        return (
                          <List.Item>
                            房间信息更新: 粉丝数: {data.fans}, 粉丝团:{" "}
                            {data.fans_club}
                          </List.Item>
                        );
                      }
                      case "SEND_GIFT": {
                        if (!f.sendGift) return null;
                        const data = (msg as TSendGift).data;

                        return (
                          <List.Item>
                            {this.getMedalInfo(data.medal_info)} {data.uname}{" "}
                            {data.action} {data.giftName}x{data.num}{" "}
                            {data.coin_type === "gold"
                              ? `${(
                                  (data.discount_price * data.num) /
                                  1000
                                ).toFixed(2)}¥/${(
                                  (data.price * data.num) /
                                  1000
                                ).toFixed(2)}¥`
                              : ""}
                          </List.Item>
                        );
                      }
                      case "WATCHED_CHANGE": {
                        if (!f.watchedChange) return null;
                        const data = (msg as TWatchedChange).data;
                        return <List.Item>看过人数更新: {data.num}</List.Item>;
                      }
                      default: {
                        return null;
                      }
                    }
                  } else {
                    if (!f.systemMessage) return null;

                    const msg = item.message;

                    switch (msg.cmd) {
                      case "activityUpdate": {
                        if (!f.activityUpdate) return null;
                        return <List.Item>人气更新: {msg.activity}</List.Item>;
                      }
                      case "joinResponse": {
                        if (!f.joinResponse) return null;
                        return <List.Item>连接回复: {msg.code}</List.Item>;
                      }
                      case "receiverStatusUpdate": {
                        if (!f.receiverStatusUpdate) return null;
                        let statusMsg = "NULL";

                        switch (msg.status) {
                          case "connecting": {
                            statusMsg = "连接中";
                            break;
                          }
                          case "open": {
                            statusMsg = "已连接";
                            break;
                          }
                          case "close": {
                            statusMsg = "未连接";
                            break;
                          }
                          case "error": {
                            statusMsg = "发生了错误";
                            break;
                          }
                        }
                        return (
                          <List.Item>直播间连接状态更新: {statusMsg}</List.Item>
                        );
                      }
                      default: {
                        return null;
                      }
                    }
                  }
                }}
              />
              {/*endregion*/}
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }

  getNameOnly(fileName: string) {
    return fileName.replace(".cdtch", "");
  }

  getMedalInfo(medalInfo: TMedalInfo): ReactNode {
    return medalInfo && medalInfo.is_lighted ? (
      <span>
        [{medalInfo.medal_name} {medalInfo.medal_level}]
      </span>
    ) : null;
  }
}
