/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./RoomBlockMsg.css";
import { TBiliBiliDanmuContent } from "../../../../../../../type/bilibili/TBiliBiliDanmuContent";
import { TRoomBlockMsg } from "../../../../../../../type/bilibili/TRoomBlockMsg";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/bilibili/userinfo/TUserInfo";

class Props {
  msg: TBiliBiliDanmuContent;
}

export class RoomBlockMsg extends React.Component<Props> {
  render(): ReactNode {
    const data: TRoomBlockMsg = this.props.msg as TRoomBlockMsg;
    return (
      <div className="RoomBlockMsg">
        <UserInfo userInfo={{ ...emptyUserInfo, uname: data.uname }} />
        已被管理员禁言
      </div>
    );
  }
}
