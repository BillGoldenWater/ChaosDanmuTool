/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./DanmuMsg.css";
import { TDanmuMsg } from "../../../../../../../type/bilibili/TDanmuMsg";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/bilibili/userinfo/TUserInfo";
import { DanmuContent } from "../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { ConfigContext } from "../../../../../utils/ConfigContext";

class Props {
  data: TDanmuMsg;
}

export class DanmuMsg extends React.Component<Props> {
  render(): JSX.Element {
    const data = this.props.data.data;

    return (
      <div className="DanmuMsg">
        {data.count > 1 ? (
          <ConfigContext.Consumer>
            {({ config }) => (
              <span style={config.style.userName}>
                {data.uName} <span style={config.style.danmuContent}>等: </span>
              </span>
            )}
          </ConfigContext.Consumer>
        ) : (
          <UserInfo
            userInfo={{
              ...emptyUserInfo,
              uname: `${data.uName}: `,
              manager: data.isAdmin,
              is_vip: data.isVip,
              is_svip: data.isSVip,
              user_level: data.userUL,
              title: data.userTitle,
            }}
            medalInfo={data.medalInfo}
          />
        )}
        <DanmuContent
          content={data.content}
          emojiData={data.emojiData}
          color={data.count > 1 ? "#F7B500" : undefined}
        />
        {data.count > 1 ? <span style={{}}> x{data.count}</span> : ""}
      </div>
    );
  }
}
