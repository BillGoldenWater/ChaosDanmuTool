/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import style from "./DanmuMsg.module.css";
import { TDanmuMsg } from "../../../../../../../type/bilibili/TDanmuMsg";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/bilibili/userinfo/TUserInfo";
import { DanmuContent } from "../../../../../../../component/bilibili/danmucontent/DanmuContent";

class Props {
  data: TDanmuMsg;
}

export class DanmuMsg extends React.Component<Props> {
  render(): JSX.Element {
    const data: TDanmuMsg = this.props.data;

    return (
      <div className={style.DanmuMsg}>
        <UserInfo
          userInfo={{
            ...emptyUserInfo,
            uname: data.uName + ": ",
            manager: data.isAdmin,
            is_vip: data.isVip,
            is_svip: data.isSVip,
            user_level: data.userUL,
            title: data.userTitle,
          }}
          medalInfo={data.medalInfo}
        />
        <DanmuContent content={data.content} emojiData={data.emojiData} />
      </div>
    );
  }
}
