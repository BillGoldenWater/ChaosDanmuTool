import React from "react";
import { UserInfo as TUserInfo } from "../../../utils/command/bilibili/UserInfo";
import { FansMedal } from "../fansmedal/FansMedal";
import { MedalInfo } from "../../../utils/command/bilibili/MedalInfo";

class Props {
  userInfo: TUserInfo;
  medalInfo?: MedalInfo;
}

export class UserInfo extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        {this.props.medalInfo && <FansMedal medalInfo={this.props.medalInfo} />}
      </div>
    );
  }
}
