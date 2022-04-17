/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  InteractWordType,
  TInteractWord,
} from "../../../../../../../type/bilibili/TInteractWord";
import React, { ReactNode } from "react";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/bilibili/userinfo/TUserInfo";
import { DanmuContent } from "../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { TMedalInfo } from "../../../../../../../type/bilibili/userinfo/TMedalInfo";

class Props {
  interactWord: TInteractWord;
}

export class InteractWord extends React.Component<Props> {
  render(): ReactNode {
    const iw: TInteractWord = this.props.interactWord;

    let action: string;

    switch (iw.data.msg_type) {
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
      default: {
        action = "msg_type:" + iw.data.msg_type;
      }
    }

    return (
      <div>
        <UserInfo
          userInfo={{
            ...emptyUserInfo,
            uname: iw.data.uname,
            name_color: iw.data.uname_color,
          }}
          medalInfo={iw.data.fans_medal as TMedalInfo}
        />
        <DanmuContent content={action} color={"#F7B500"} />
      </div>
    );
  }
}
