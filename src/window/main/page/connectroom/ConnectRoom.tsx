/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { Button, Form, InputNumber, Space } from "antd";
import { ConfigContext } from "../../utils/ConfigContext";
import { ReceiverStatus } from "../../../../command/ReceiverStatusUpdate";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { biliBiliDanmuTestData } from "../../../../data/BiliBiliDanmuTestData";
import { getMessageCommand } from "../../../../command/MessageCommand";
import { TBiliBiliDanmuContent } from "../../../../type/bilibili/TBiliBiliDanmuContent";
import { getMessageLogMessage } from "../../../../command/messagelog/MessageLog";
import { ConfigItem } from "../../../../component/configitem/ConfigItem";

class Props {
  receiverStatus: ReceiverStatus;
}

export class ConnectRoom extends React.Component<Props> {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ get, set }) => {
          const p = this.props;

          const open = p.receiverStatus == "open";
          const connecting = p.receiverStatus == "connecting";
          let icon = <></>;
          switch (p.receiverStatus) {
            case "connecting": {
              icon = <LoadingOutlined />;
              break;
            }
            case "open": {
              icon = <CheckCircleOutlined style={{ color: "#0f0" }} />;
              break;
            }
            case "close": {
              icon = <CloseCircleOutlined style={{ color: "#ff0" }} />;
              break;
            }
            case "error": {
              icon = <WarningOutlined style={{ color: "#f00" }} />;
              break;
            }
          }

          return (
            <div>
              <Form.Item label="房间号">
                <Space>
                  <InputNumber
                    min={0}
                    value={get("danmuReceiver.roomid") as number}
                    onChange={(value) => {
                      if (value == null) return;
                      set("danmuReceiver.roomid", value);
                    }}
                  />
                  <Button
                    type={"primary"}
                    onClick={() => {
                      if (open || connecting) {
                        window.electron.disconnect();
                      } else {
                        const roomid = get("danmuReceiver.roomid") as number;
                        if (roomid == 0) {
                          biliBiliDanmuTestData.forEach((value) => {
                            window.electron.commandBroadcast(
                              JSON.stringify(
                                getMessageLogMessage(
                                  getMessageCommand(
                                    value as TBiliBiliDanmuContent
                                  )
                                )
                              )
                            );
                          });
                          return;
                        }
                        window.electron.connect(roomid);
                      }
                    }}
                  >
                    {open || connecting ? "断开" : "连接"}
                  </Button>
                  {icon}
                </Space>
              </Form.Item>
              <ConfigItem
                type={"boolean"}
                name={"自动重连"}
                value={get("danmuReceiver.autoReconnect")}
                setBoolean={(value) => {
                  set("danmuReceiver.autoReconnect", value);
                }}
                description={"在异常断开直播间时自动重连, 延迟1秒, 最多尝试5次"}
              />
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
