/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";
import { TextIcon } from "../texticon/TextIcon";

class Props {
  isSvip?: boolean;
}

export class VipIcon extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config }) => {
          const text = this.props.isSvip
            ? config.style.svipIcon.text
            : config.style.vipIcon.text;

          return (
            <TextIcon
              style={
                this.props.isSvip
                  ? config.style.svipIcon.style
                  : config.style.vipIcon.style
              }
            >
              {text}
            </TextIcon>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
