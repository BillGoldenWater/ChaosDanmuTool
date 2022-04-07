/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./Gacha.less";
import { Button, Card } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { GachaCheckResultWithUName, GachaUtils } from "../../utils/GachaUtils";
import { GachaUser } from "./GachaUser";
import { TDanmuMsg } from "../../../../type/bilibili/TDanmuMsg";
import { GachaLogItem } from "./GachaLogItem";

class Props {}

class State {
  gachaLog: GachaCheckResultWithUName[];
}

export class Gacha extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      gachaLog: [],
    };

    GachaUtils.joinText = "1";

    GachaUtils.userLevelLimit = 1;

    GachaUtils.medalLevelLimit = 1;
    GachaUtils.medalRoomid = 2;

    const testDm: TDanmuMsg = {
      cmd: "DANMU_MSG",
      data: {
        fontsize: 0,
        color: 0,
        timestamp: new Date().getTime() / 1000,
        emojiData: null,

        content: "1",

        uid: 0,
        uName: "User name",
        isAdmin: 1,
        isVip: 0,
        isSVip: 0,

        medalInfo: {
          anchor_uname: "1",
          anchor_roomid: 2,
          guard_level: 0,
          icon_id: 0,
          is_lighted: 1,
          medal_color: 0,
          medal_color_border: 0,
          medal_color_end: 0,
          medal_color_start: 0,
          medal_level: 1,
          medal_name: "",
          score: 0,
          special: "",
          target_id: 0,
        },

        userUL: 1,

        userTitle: "",
        userTitle1: "",

        isHistory: true,
        count: 1,
      },
    };

    this.state.gachaLog.push(["!", GachaUtils.check(testDm)]);

    GachaUtils.join(testDm);
    GachaUtils.join({ ...testDm, data: { ...testDm.data, uid: 1 } });
    GachaUtils.join({ ...testDm, data: { ...testDm.data, uid: 2 } });
    GachaUtils.join({ ...testDm, data: { ...testDm.data, uid: 3 } });

    this.state.gachaLog.push([
      "!",
      GachaUtils.check({
        ...testDm,
        data: { ...testDm.data, uid: 5, userUL: 0 },
      }),
    ]);
    this.state.gachaLog.push([
      "!",
      GachaUtils.check({
        ...testDm,
        data: { ...testDm.data, uid: 5, medalInfo: null },
      }),
    ]);
    this.state.gachaLog.push([
      "!",
      GachaUtils.check({
        ...testDm,
        data: {
          ...testDm.data,
          uid: 5,
          medalInfo: { ...testDm.data.medalInfo, is_lighted: 0 },
        },
      }),
    ]);
    this.state.gachaLog.push([
      "!",
      GachaUtils.check({
        ...testDm,
        data: {
          ...testDm.data,
          uid: 5,
          medalInfo: { ...testDm.data.medalInfo, anchor_roomid: 1 },
        },
      }),
    ]);
    this.state.gachaLog.push([
      "!",
      GachaUtils.check({
        ...testDm,
        data: {
          ...testDm.data,
          uid: 5,
          medalInfo: { ...testDm.data.medalInfo, medal_level: 0 },
        },
      }),
    ]);

    console.log(this.state.gachaLog);
  }

  render() {
    const users = Array.from(GachaUtils.joinedUsers.entries()).map((entry) => (
      <GachaUser key={entry[0]} user={entry[1]} />
    ));

    const logs = this.state.gachaLog.map((value) => (
      <GachaLogItem item={value} />
    ));

    return (
      <Card className={"main_content_without_padding Gacha"}>
        <Card className={"GachaInformation"}>
          <div className={"GachaInfos"}>
            <div>抽奖参与弹幕: {GachaUtils.joinText}</div>
            <div>
              参与条件:{" "}
              {GachaUtils.userLevelLimit !== -1
                ? `用户等级达到 ${GachaUtils.userLevelLimit}; `
                : ""}
              {GachaUtils.medalLevelLimit !== -1 &&
              GachaUtils.medalRoomid !== -1
                ? `粉丝勋章等级达到 ${GachaUtils.medalLevelLimit}(${GachaUtils.medalRoomid})`
                : ""}
            </div>
          </div>
          <div className={"GachaUsers"}>{users}</div>
        </Card>
        <Card className={"GachaControlPanel"}>
          <div className={"GachaControls"}>
            <Button>开始统计</Button>
            <Button>抽!</Button>
            <Button icon={<SettingOutlined />} />
          </div>
          <div className={"GachaLog"}>{logs}</div>
        </Card>
      </Card>
    );
  }
}
