import React, { ReactNode } from "react";
import { TSendGift as TSendGift } from "../../../../../../../../model/TSendGift";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../../model/TUserInfo";
import { GiftIcon } from "../../../../../../../../component/bilibili/gifticon/GiftIcon";
import { ConfigContext } from "../../../../../../utils/ConfigContext";
import { TGiftConfig } from "../../../../../../../../model/giftconfig/TGiftConfig";
import { TGiftInfo } from "../../../../../../../../model/giftconfig/TGiftInfo";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";

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
            <div>
              <UserInfo
                userInfo={{
                  ...emptyUserInfo,
                  uname: data.uname,
                  face: data.face,
                }}
                medalInfo={data.medal_info}
              />
              {data.action} {data.giftName}
              <GiftIcon src={gi ? gi.webp || gi.img_basic : ""} /> 共 {data.num}{" "}
              个{" "}
              {gi
                ? gi.coin_type == "gold"
                  ? ((gi.price / 1000) * data.num).toFixed(2).toString() + "￥"
                  : ""
                : ""}
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
