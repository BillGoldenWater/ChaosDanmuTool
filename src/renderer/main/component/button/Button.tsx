/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Button.less";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  primary?: boolean;
  disabled?: boolean;
};

export class Button extends React.Component<Props> {
  render(): ReactNode {
    const { primary, disabled } = this.props;
    const primaryClass = primary ? " ButtonPrimary" : "";
    const disabledClass = disabled ? " ButtonDisabled" : "";

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const props = { ...this.props, primary: undefined };

    return (
      <button className={"Button" + primaryClass + disabledClass} {...props}>
        {this.props.children}
      </button>
    );
  }
}
