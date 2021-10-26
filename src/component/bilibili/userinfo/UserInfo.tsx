import React from "react";
import style from "./UserInfo.module.css";
import { UserInfo as TUserInfo } from "../../../utils/command/bilibili/UserInfo";
import { FansMedal } from "../fansmedal/FansMedal";
import { MedalInfo } from "../../../utils/command/bilibili/MedalInfo";
import { UserName } from "../username/UserName";
import { AdminIcon } from "../adminicon/AdminIcon";
import { VipIcon } from "../vipicon/VipIcon";

class Props {
  userInfo: TUserInfo;
  medalInfo?: MedalInfo;
}

export class UserInfo extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.UserInfo}>
        {this.props.medalInfo && <FansMedal medalInfo={this.props.medalInfo} />}
        {this.props.userInfo.manager == 1 && <AdminIcon />}
        {this.props.userInfo.is_vip == 1 && <VipIcon />}
        {this.props.userInfo.is_svip == 1 && <VipIcon isSvip={true} />}
        <UserName name={this.props.userInfo.uname} />
      </div>
    );
  }
}
