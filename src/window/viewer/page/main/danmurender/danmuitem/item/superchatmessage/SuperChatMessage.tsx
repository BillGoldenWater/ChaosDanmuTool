import React from "react";
import style from "./SuperChatMessage.module.css";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { SuperChatMessage as TSuperChatMessage } from "../../../../../../../../utils/command/bilibili/SuperChatMessage";
import { DanmuContent } from "../../../../../../../../component/bilibili/danmucontent/DanmuContent";

class Props {
  msg: DanmuMessage;
}

export class SuperChatMessage extends React.Component<Props> {
  render(): JSX.Element {
    const scm: TSuperChatMessage = this.props.msg as TSuperChatMessage;
    return (
      <div className={style.SuperChatMessage}>
        <img
          src={scm.data.background_image}
          style={{ display: "none" }}
          alt={""}
        />
        {/* load img to cache for "background-image" to bypass referrer policy */}
        <div
          className={style.SuperChatMessage_top}
          style={{
            backgroundImage: "url(" + scm.data.background_image + ")",
            backgroundColor: scm.data.background_color,
            borderColor: scm.data.background_bottom_color,
          }}
        >
          <UserInfo
            userInfo={scm.data.user_info}
            medalInfo={scm.data.medal_info}
          />
          <div className={style.SuperChatMessage_top_price}>
            {scm.data.price}￥
          </div>
        </div>
        <div
          className={style.SuperChatMessage_bottom}
          style={{
            backgroundColor: scm.data.background_bottom_color,
            borderColor: scm.data.background_bottom_color,
          }}
        >
          <DanmuContent
            content={scm.data.message}
            color={scm.data.message_font_color}
          />
        </div>
      </div>
    );
  }
}
