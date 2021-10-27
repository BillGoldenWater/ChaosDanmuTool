import React from "react";
import style from "./SuperChatMessage.module.css";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { SuperChatMessage as TSuperChatMessage } from "../../../../../../../../utils/command/bilibili/SuperChatMessage";

class Props {
  msg: DanmuMessage;
}

export class SuperChatMessage extends React.Component<Props> {
  render(): JSX.Element {
    const scm: TSuperChatMessage = this.props.msg as TSuperChatMessage;
    return (
      <div className={style.SuperChatMessage}>
        <div>
          <UserInfo
            userInfo={scm.data.user_info}
            medalInfo={scm.data.medal_info}
          />
        </div>
        <div>{scm.data.message}</div>
      </div>
    );
  }
}
