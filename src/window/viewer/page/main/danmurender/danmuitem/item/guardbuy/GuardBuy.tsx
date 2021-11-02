import React, { ReactNode } from "react";
import { DanmuMessage } from "../../../../../../../../utils/command/DanmuMessage";
import {
  getGuardIconUrl,
  TGuardBuy,
} from "../../../../../../../../type/TGuardBuy";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../../type/TUserInfo";
import { GiftIcon } from "../../../../../../../../component/bilibili/gifticon/GiftIcon";

class Props {
  msg: DanmuMessage;
}

export class GuardBuy extends React.Component<Props> {
  render(): ReactNode {
    const data = (this.props.msg as TGuardBuy).data;
    return (
      <div>
        <UserInfo userInfo={{ ...emptyUserInfo, uname: data.username }} /> 购买
        {` ${data.gift_name} `}
        <GiftIcon src={getGuardIconUrl(data.guard_level)} /> {data.num} 个
      </div>
    );
  }
}
