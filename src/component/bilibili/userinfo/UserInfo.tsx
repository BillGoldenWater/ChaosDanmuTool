import React from "react";
import style from "./UserInfo.module.css";
import { UserInfo as TUserInfo } from "../../../utils/command/bilibili/UserInfo";
import { FansMedal } from "../fansmedal/FansMedal";
import { MedalInfo } from "../../../utils/command/bilibili/MedalInfo";
import { UserName } from "../username/UserName";

class Props {
  userInfo: TUserInfo;
  medalInfo?: MedalInfo;
}

export class UserInfo extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.UserInfo}>
        {this.props.medalInfo && <FansMedal medalInfo={this.props.medalInfo} />}
        <UserName name={this.props.userInfo.uname} />
      </div>
    );
  }
}
