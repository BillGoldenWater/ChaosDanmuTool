/*
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
                    onChange={(value) => set("danmuReceiver.roomid", value)}
                  />
                  <Button
                    type={"primary"}
                    onClick={() => {
                      if (open) {
                        window.electron.disconnect();
                      } else {
                        const roomid = get("danmuReceiver.roomid") as number;
                        if (roomid == 0) {
                          biliBiliDanmuTestData.forEach((value) => {
                            window.electron.commandBroadcast(
                              JSON.stringify(
                                getMessageCommand(
                                  value as TBiliBiliDanmuContent
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
                    {!open ? "连接" : "断开"}
                  </Button>
                  {icon}
                </Space>
              </Form.Item>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
