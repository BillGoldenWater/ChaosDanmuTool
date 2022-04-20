/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Menu.less";
import { MenuItemProps } from "./MenuItem";

class Props {
  itemList: ReactNode[];
  selectedKey: string;
  onSelectNew: (key: string) => void;
}

class State {}

export class Menu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    console.log(props);

    this.state = {};
  }

  render(): ReactNode {
    const { itemList: items, selectedKey, onSelectNew } = this.props;
    const itemList = items.map((value) => {
      if (!React.isValidElement(value)) return value;

      const onClick = () => {
        onSelectNew(value.key as string);
      };

      const props: MenuItemProps = {
        icon: value.props.icon,
        selected: false,
        onClick: onClick,
      };
      if (value.key === selectedKey) {
        props.selected = true;
        return React.cloneElement(value, props);
      } else {
        return React.cloneElement(value, props);
      }
    });

    return <div className={"Menu"}>{itemList}</div>;
  }
}
