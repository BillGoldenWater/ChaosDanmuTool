/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import {
  GachaCheckResult,
  GachaCheckResultWithUName,
} from "../../utils/GachaUtils";

class Props {
  item: GachaCheckResultWithUName;
}

function getResultTextAndColor(result: GachaCheckResult): [string, string] {
  switch (result) {
    case GachaCheckResult.LowUserLevel:
      return ["用户等级不足", "#c00"];
    case GachaCheckResult.EmptyMedal:
      return ["未佩戴粉丝勋章", "#c00"];
    case GachaCheckResult.MedalNotLighted:
      return ["粉丝勋章未点亮", "#c00"];
    case GachaCheckResult.WrongMedal:
      return ["未佩戴指定粉丝勋章", "#c00"];
    case GachaCheckResult.LowMedalLevel:
      return ["粉丝勋章等级不足", "#c00"];
    case GachaCheckResult.Ok:
      return ["参与成功", "#0c0"];
    default:
      return ["未知错误", "#fff"];
  }
}

export class GachaLogItem extends React.Component<Props> {
  render() {
    const {
      item: [uName, result],
    } = this.props;

    const [text, color] = getResultTextAndColor(result);

    return (
      <div>
        {uName} <span style={{ color: color }}>{text}</span>
      </div>
    );
  }
}
