/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { MouseEventHandler, ReactNode } from "react";
import "./MenuItem.less";

export class MenuItemProps {
  icon?: ReactNode;
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
    const { children, icon, selected, onClick } = this.props;
    const withIconClass = icon ? ` MenuItemIcon` : "";
    const selectedClass = selected ? ` MenuItemSelected` : "";
    return (
      <div
        className={`MenuItem${withIconClass}${selectedClass}`}
        onClick={onClick}
      >
        {icon ?? children}
      </div>
    );
  }
}
