/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode, RefObject } from "react";
import "./Select.less";

class SelectItem<V> {
  key: string;
  value?: V;
  render?: (value: V) => ReactNode;
}

class Props<V> {
  disabled?: boolean;
  defaultSelect?: string;
  list: SelectItem<V>[];
  onChange?: (key: string) => void;
}

class State {
  select: string;
}

export class Select<V> extends React.Component<Props<V>, State> {
  selectElement: HTMLDivElement;
  selectedRef: RefObject<HTMLDivElement> = React.createRef();
  selectListRef: RefObject<HTMLDivElement> = React.createRef();
  animate: Animation;
  focused = false;

  constructor(props: Props<V>) {
    super(props);

    const { defaultSelect, list } = props;

    const defaultKey = list && list.length > 0 ? list[0].key : "";
    this.state = {
      select: defaultSelect || defaultKey,
    };
  }

  renderItem(item: SelectItem<V>) {
    return item.render
      ? item.render(item.value)
      : item.value && typeof item.value === "string"
      ? item.value
      : item.key;
  }

  onFocus() {
    if (this.props.disabled) return;

    const list = this.selectListRef.current;
    const selected = this.selectedRef.current;

    if (!list || !selected) return;

    const startRect = selected.getBoundingClientRect();
    selected.style.display = "none";
    list.style.display = "inline-flex";
    const finalRect = list.getBoundingClientRect();

    this.animate?.cancel();
    this.animate = list.animate(
      [
        {
          height: `${startRect.height}px`,
          width: `${startRect.width}px`,
        },
        {
          height: `${finalRect.height}px`,
          width: `${finalRect.width}px`,
        },
      ],
      {
        duration: 200,
        easing: "cubic-bezier(0.25, 0, 0, 1)",
      }
    );
    this.animate.onfinish = () => {
      this.focused = true;
    };
  }

  onBlur() {
    if (!this.focused) return;

    const list = this.selectListRef.current;
    const selected = this.selectedRef.current;

    if (!list || !selected) return;

    const startRect = list.getBoundingClientRect();
    selected.style.display = "inline-flex";
    const finalRect = selected.getBoundingClientRect();
    selected.style.display = "none";

    this.animate?.cancel();
    this.animate = list.animate(
      [
        {
          height: `${startRect.height}px`,
        },
        {
          height: `${finalRect.height}px`,
        },
      ],
      {
        duration: 200,
        easing: "cubic-bezier(0.25, 0, 0, 1)",
      }
    );
    this.animate.onfinish = () => {
      list.style.display = "none";
      selected.style.display = "inline-flex";
      this.focused = false;
    };
  }

  render(): ReactNode {
    const { disabled, list, onChange } = this.props;
    const { select } = this.state;

    const selectedItem = list.find((item) => item.key === select) || list[0];
    const selectedElement = this.renderItem(selectedItem);

    const selectItems = list.map((item) => (
      <div
        key={item.key}
        className={
          item.key === select ? "SelectListItemSelected" : "SelectListItem"
        }
        onClick={() => {
          if (this.state.select === item.key) return;
          this.setState({ select: item.key });
          this.selectElement.blur();
          onChange(item.key);
        }}
      >
        {this.renderItem(item)}
      </div>
    ));

    const selectedClass = !disabled
      ? "SelectSelected"
      : "SelectSelectedDisabled";

    return (
      <div
        tabIndex={0}
        className={"Select"}
        ref={(element) => {
          this.selectElement = element;
          if (element) {
            element.style.height = window.getComputedStyle(element).height;
          }
        }}
        onFocus={this.onFocus.bind(this)}
        onBlur={this.onBlur.bind(this)}
      >
        <div className={selectedClass} ref={this.selectedRef}>
          {selectedElement}
        </div>
        <div className={"SelectList"} ref={this.selectListRef}>
          {selectItems}
        </div>
      </div>
    );
  }
}
