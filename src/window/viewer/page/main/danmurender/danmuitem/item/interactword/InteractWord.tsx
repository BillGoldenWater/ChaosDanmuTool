import {
  InteractWord as TInteractWord,
  InteractWordType,
} from "../../../../../../../../utils/command/bilibili/InteractWord";
import React, { ReactNode } from "react";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../../utils/command/bilibili/UserInfo";
import { DanmuContent } from "../../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { MedalInfo } from "../../../../../../../../utils/command/bilibili/MedalInfo";

class Props {
  data: TInteractWord;
}

export class InteractWord extends React.Component<Props> {
  render(): ReactNode {
    const iw: TInteractWord = this.props.data;

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
          medalInfo={iw.fans_medal as MedalInfo}
        />
        <DanmuContent content={action} color={"#F7B500"} />
      </div>
    );
  }
}
