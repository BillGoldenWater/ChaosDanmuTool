/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";
import { Input } from "../../../../../rendererShare/component/input/Input";
import { isInt } from "../../../../../share/utils/NumberUtils";
import { Button } from "../../../../../rendererShare/component/button/Button";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";

export class ConnectionManager extends React.Component {
  render(): ReactNode {
    return (
      <ConfigC>
        {({ state, set, get }) => {
          const { receiverStatus } = state;

          const open = receiverStatus == "open";
          const connecting = receiverStatus == "connecting";
          let icon = <></>;
          switch (receiverStatus) {
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
              房间号:
              <Spacer half />
              <Input
                disabled={receiverStatus != "close"}
                type={"number"}
                min={0}
                defaultValue={get("danmuReceiver.roomid") as number}
                onChange={(value) => {
                  if (isInt(value.target.value)) {
                    set("danmuReceiver.roomid", parseInt(value.target.value));
                  }
                }}
              />
              <Spacer half />
              <Button
                primary
                onClick={async () => {
                  if (open || connecting) {
                    window.electron.disconnect();
                  } else {
                    const roomid = get("danmuReceiver.roomid") as number;
                    // if (roomid == 0) {
                    //   biliBiliDanmuTestData.forEach((value) => {
                    //     window.electron.commandBroadcast(
                    //       JSON.stringify(
                    //         getMessageLogMessage(
                    //           getMessageCommand(
                    //             value as TBiliBiliDanmuContent
                    //           )
                    //         )
                    //       )
                    //     );
                    //   });
                    //   return;
                    // } TODO: test data

                    const id = await window.electron.getRoomid(roomid);
                    window.electron.connect(id);
                  }
                }}
              >
                {open || connecting ? "断 开" : "连 接"}
              </Button>
              <Spacer half />
              {icon}
            </div>
          );
        }}
      </ConfigC>
    );
  }
}
