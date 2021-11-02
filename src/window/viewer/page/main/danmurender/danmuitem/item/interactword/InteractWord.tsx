import {
  TInteractWord as TInteractWord,
  InteractWordType,
} from "../../../../../../../../model/TInteractWord";
import React, { ReactNode } from "react";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../../model/TUserInfo";
import { DanmuContent } from "../../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { TMedalInfo } from "../../../../../../../../model/TMedalInfo";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";

class Props {
  msg: DanmuMessage;
}

export class InteractWord extends React.Component<Props> {
  render(): ReactNode {
    const iw: TInteractWord = this.props.msg as unknown as TInteractWord;

    let action: string;

    switch (iw.msg_type) {
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
        action = "msg_type:" + iw.msg_type;
      }
    }

    return (
      <div>
        <UserInfo
          userInfo={{
            ...emptyUserInfo,
            uname: iw.uname,
            name_color: iw.uname_color,
          }}
          medalInfo={iw.fans_medal as TMedalInfo}
        />
        <DanmuContent content={action} color={"#F7B500"} />
      </div>
    );
  }
}
