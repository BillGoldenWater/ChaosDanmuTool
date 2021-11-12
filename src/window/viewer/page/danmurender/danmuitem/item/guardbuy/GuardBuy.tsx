import React, { ReactNode } from "react";
import { DanmuMessage } from "../../../../../../../utils/command/DanmuMessage";
import {
  getGuardIconUrl,
  TGuardBuy,
} from "../../../../../../../type/TGuardBuy";
import { UserInfo } from "../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../type/TUserInfo";
import { GiftContent } from "../../../../../../../component/bilibili/giftcontent/GiftContent";

class Props {
  msg: DanmuMessage;
}

export class GuardBuy extends React.Component<Props> {
  render(): ReactNode {
    const data = (this.props.msg as TGuardBuy).data;
    return (
      <div>
        <UserInfo userInfo={{ ...emptyUserInfo, uname: data.username }} />
        <GiftContent
          action={"购买"}
          name={data.gift_name}
          iconUrl={getGuardIconUrl(data.guard_level)}
          num={data.num}
          price={((data.price / 1000) * data.num).toFixed(2).toString() + "￥"}
        />
      </div>
    );
  }
}