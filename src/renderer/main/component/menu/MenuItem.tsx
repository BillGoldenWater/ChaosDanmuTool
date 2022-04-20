/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { MouseEventHandler, ReactNode, RefObject } from "react";
import "./MenuItem.less";

export class MenuItemProps {
  icon?: ReactNode;
  name?: string;

  ref?: RefObject<HTMLDivElement>;
  className?: string;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

class State {}

export class MenuItem extends React.Component<MenuItemProps, State> {
  constructor(props: MenuItemProps) {
    super(props);

    this.state = {};
  }

  render(): ReactNode {
    const { icon, name, ref, className, selected, onClick } = this.props;

    const mainClassName =
      (selected ? "MenuItemSelected" : "MenuItem") +
      (className ? ` ${className}` : "");
    return (
      <div ref={ref} className={mainClassName} onClick={onClick}>
        <div className={"MenuItemIcon"}>{icon}</div>
        <div className={"MenuItemName"}>{name}</div>
      </div>
    );
  }
}
