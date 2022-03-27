/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import "./DanmuRender.css";
import {DanmuItem} from "./danmuitem/DanmuItem";
import {DanmuMessageWithKey} from "../../../../type/bilibili/TBiliBiliDanmuContent";
import {ConfigContext} from "../../utils/ConfigContext";

class Props {
  danmuList: DanmuMessageWithKey[];
}

export class DanmuRender extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const danmuItems = this.props.danmuList.map((value) => {
      return <DanmuItem key={value.key} message={value.msg}/>;
    });

    return (
      <ConfigContext.Consumer>
        {({config}) => (
          <div
            className="DanmuRender"
            style={{
              margin: config.style.listMargin,
              lineHeight: config.style.mainStyle.lineHeight,
            }}
          >
            {danmuItems}
          </div>
        )}
      </ConfigContext.Consumer>
    );
  }
}
