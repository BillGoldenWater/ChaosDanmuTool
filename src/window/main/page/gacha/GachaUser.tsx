/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./GachaUser.less";
import { TGachaUser } from "../../utils/GachaUtils";

class Props {
  user: TGachaUser;
  isWinner?: boolean;
}

export class GachaUser extends React.Component<Props> {
  render() {
    const {
      user: {
        userInfo: { uname },
        latestDanmu: {
          data: { content },
        },
      },
      isWinner,
    } = this.props;

    return (
      <div className={"GachaUser" + (isWinner ? " GachaUserWinner" : "")}>
        <div>{uname}</div>
        <div className={"GachaUserLatestDanmu"}>{content}</div>
      </div>
    );
  }
}
