/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./Switch.less";

class Props {
  disabled?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
}

class State {
  value: boolean;
}

export class Switch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.defaultValue,
    };
  }

  render(): ReactNode {
    const { disabled, onChange } = this.props;
    const { value } = this.state;

    const switchClass = !disabled ? "Switch" : "SwitchDisabled";
    const sliderClass = !disabled ? "Slider" : "SliderDisabled";
    const switchChecked = value ? "SwitchChecked" : "";

    return (
      <div
        className={`${switchClass} ${switchChecked}`}
        onClick={() => {
          if (disabled) return;
          this.setState((prevState) => {
            onChange && onChange(!prevState.value);
            return {
              value: !prevState.value,
            };
          });
        }}
      >
        <div className={sliderClass} />
      </div>
    );
  }
}
