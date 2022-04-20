/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode, RefObject } from "react";
import "./Menu.less";
import { MenuItem, MenuItemProps } from "./MenuItem";
import { EllipsisOutlined, QuestionOutlined } from "@ant-design/icons";

class Props {
  itemList: ReactNode[];
  selectedKey: string;
  onSelectNew: (key: string) => void;
}

class State {
  showName: boolean;
}

export class Menu extends React.Component<Props, State> {
  cursorRef: RefObject<HTMLDivElement> = React.createRef();
  itemRefs: Map<string, RefObject<HTMLDivElement>> = new Map();

  constructor(props: Props) {
    super(props);

    this.state = {
      showName: false,
    };

    this.updateItemRefs();
  }

  componentDidUpdate() {
    this.updateItemRefs();
  }

  updateItemRefs() {
    this.props.itemList.forEach((value) => {
      if (!React.isValidElement(value)) return value;
      const prev = this.itemRefs.get(value.key as string);
      if (!prev) this.itemRefs.set(value.key as string, React.createRef());
    });
  }

  updateCursor() {
    const { selectedKey } = this.props;

    const cursor: HTMLDivElement = this.cursorRef?.current;
    if (cursor) {
      const targetItem = this.itemRefs.get(selectedKey)?.current;
      if (targetItem) {
        const cursorRect = cursor.getBoundingClientRect();
        const targetRect = targetItem.getBoundingClientRect();
        const heightCenter = targetRect.top + targetRect.height / 2;
        const targetTop = heightCenter - cursorRect.height / 2;
        const targetLeft = targetRect.left + cursorRect.width * (1 - 0.2);

        cursor.style.top = `${targetTop}px`;
        cursor.style.left = `${targetLeft}px`;
      }
    }
  }

  render(): ReactNode {
    const { itemList: items, selectedKey, onSelectNew } = this.props;
    const { showName } = this.state;

    const itemList = items.map((value) => {
      if (!React.isValidElement(value)) return value;

      const onClick = () => {
        onSelectNew(value.key as string);
      };

      const ref = this.itemRefs.get(value.key as string);

      const props: MenuItemProps = {
        selected: false,
        onClick: onClick,
      };
      if (value.key === selectedKey) props.selected = true;
      return (
        <div ref={ref} key={value.key}>
          {React.cloneElement(value, props)}
        </div>
      );
    });

    this.updateCursor();

    return (
      <div
        ref={() => window.setTimeout(this.updateCursor.bind(this), 10)}
        className={showName ? "MenuShowName" : "Menu"}
      >
        <div ref={this.cursorRef} className={"MenuCursor"} />
        <div className={"MenuItemList"}>{itemList}</div>
        <div className={"MenuItemListShowNameSwitch"}>
          <MenuItem
            name={"收起"}
            icon={showName ? <EllipsisOutlined /> : <QuestionOutlined />}
            onClick={() => {
              this.setState((prevState) => ({ showName: !prevState.showName }));
            }}
          />
        </div>
      </div>
    );
  }
}
