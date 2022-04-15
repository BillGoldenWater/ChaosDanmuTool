/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./SendGift.css";
import { TSendGift } from "../../../../../../../type/bilibili/TSendGift";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/bilibili/userinfo/TUserInfo";
import { ConfigContext } from "../../../../../utils/ConfigContext";
import { TGiftConfig } from "../../../../../../../type/bilibili/request/giftconfig/TGiftConfig";
import { TGiftInfo } from "../../../../../../../type/bilibili/request/giftconfig/TGiftInfo";
import { GiftContent } from "../../../../../../../component/bilibili/giftcontent/GiftContent";

class Props {
  sendGift: TSendGift;
}

export class SendGift extends React.Component<Props> {
  render(): ReactNode {
    const data = this.props.sendGift.data;
    return (
      <ConfigContext.Consumer>
        {({ giftConfig }) => {
          const gc: TGiftConfig = giftConfig;
          const gi: TGiftInfo = gc ? gc.data.get(data.giftId) : undefined;

          let priceTag = "";
          if (gi && gi.coin_type == "gold") {
            const price = (gi.price / 1000) * data.num;

            priceTag = `￥${price.toFixed(2)}`;
          }

          return (
            <div className="SendGift">
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
                price={priceTag}
              />
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
