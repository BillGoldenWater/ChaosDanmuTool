import React from "react";
import style from "./UserInfo.module.css";
import { UserInfo as TUserInfo } from "../../../model/UserInfo";
import { FansMedal } from "../fansmedal/FansMedal";
import { MedalInfo } from "../../../model/MedalInfo";
import { UserName } from "../username/UserName";
import { AdminIcon } from "../adminicon/AdminIcon";
import { VipIcon } from "../vipicon/VipIcon";
import { UserFace } from "../userface/UserFace";

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
        {this.props.userInfo.face && this.props.userInfo.face != "" && (
          <UserFace face={this.props.userInfo.face} />
        )}
        <UserName name={this.props.userInfo.uname} />
      </div>
    );
  }
}
