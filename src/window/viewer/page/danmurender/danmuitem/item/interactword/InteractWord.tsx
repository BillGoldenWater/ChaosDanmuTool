import {
  InteractWordType,
  TInteractWord,
} from "../../../../../../../type/TInteractWord";
import React, { ReactNode } from "react";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/TUserInfo";
import { DanmuContent } from "../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { TMedalInfo } from "../../../../../../../type/TMedalInfo";

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
