import React from "react";
import style from "./DanmuMsg.module.css";
import { DanmuMsg as TDanmuMsg } from "../../../../../../../../utils/command/bilibili/DanmuMsg";
import { UserInfo } from "../../../../../../../../component/bilibili/userinfo/UserInfo";
import { emptyUserInfo } from "../../../../../../../../utils/command/bilibili/UserInfo";

class Props {
  data: TDanmuMsg;
}

export class DanmuMsg extends React.Component<Props> {
  render(): JSX.Element {
    const data: TDanmuMsg = this.props.data;

    return (
      <div className={style.DanmuMsg}>
        <UserInfo
          userInfo={{
            ...emptyUserInfo,
            uname: data.uName + ": ",
            manager: data.isAdmin,
            is_vip: data.isVip,
            is_svip: data.isSVip,
            user_level: data.userUL,
            title: data.userTitle,
          }}
          medalInfo={data.medalInfo}
        />
        {data.content}
      </div>
    );
  }
}
