import React, { ReactNode } from "react";
import style from "./SendGift.module.css";
import { TSendGift } from "../../../../../../../type/TSendGift";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/TUserInfo";
import { ConfigContext } from "../../../../../utils/ConfigContext";
import { TGiftConfig } from "../../../../../../../type/giftconfig/TGiftConfig";
import { TGiftInfo } from "../../../../../../../type/giftconfig/TGiftInfo";
import { DanmuMessage } from "../../../../../../../utils/command/DanmuMessage";
import { GiftContent } from "../../../../../../../component/bilibili/giftcontent/GiftContent";

class Props {
  msg: DanmuMessage;
}

export class SendGift extends React.Component<Props> {
  render(): ReactNode {
    const data = (this.props.msg as TSendGift).data;
    return (
      <ConfigContext.Consumer>
        {({ giftConfig }) => {
          const gc: TGiftConfig = giftConfig;
          const gi: TGiftInfo = gc ? gc.data.get(data.giftId) : undefined;
          return (
            <div className={style.SendGift}>
              <UserInfo
                userInfo={{
                  ...emptyUserInfo,
                  uname: data.uname,
                  face: data.face,
                }}
                medalInfo={data.medal_info}
              />
              <GiftContent
                action={data.action}
                name={data.giftName}
                iconUrl={gi ? gi.webp || gi.img_basic : ""}
                num={data.num}
                price={
                  gi
                    ? gi.coin_type == "gold"
                      ? ((gi.price / 1000) * data.num).toFixed(2).toString() +
                        "￥"
                      : ""
                    : ""
                }
              />
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
