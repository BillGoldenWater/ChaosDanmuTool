import React from "react";
import style from "./SuperChatMessage.module.css";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { SuperChatMessage as TSuperChatMessage } from "../../../../../../../../model/SuperChatMessage";
import { DanmuContent } from "../../../../../../../../component/bilibili/danmucontent/DanmuContent";
import { ConfigContext } from "../../../../../../utils/ConfigContext";

class Props {
  msg: DanmuMessage;
}

class State {
  ts: number;
}

export class SuperChatMessage extends React.Component<Props, State> {
  updateIntervalId: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      ts: new Date().getTime() / 1000,
    };

    this.updateIntervalId = window.setInterval(() => {
      this.setState({ ts: new Date().getTime() / 1000 });
      const scm: TSuperChatMessage = this.props.msg as TSuperChatMessage;
      if (this.state.ts > scm.data.end_time) {
        window.clearInterval(this.updateIntervalId);
      }
    }, 100);
  }

  render(): JSX.Element {
    const scm: TSuperChatMessage = this.props.msg as TSuperChatMessage;
    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <div
            className={
              style.SuperChatMessage +
              (this.state.ts <= scm.data.end_time && config.superChatAlwaysOnTop
                ? " " + style.SuperChatMessage_sticky
                : "")
            }
          >
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
            <progress
              className={style.SuperChatMessage_progress}
              max={scm.data.time}
              value={scm.data.time - (scm.data.end_time - this.state.ts)}
              style={{ backgroundColor: scm.data.background_bottom_color }}
            />
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
        )}
      </ConfigContext.Consumer>
    );
  }
}
