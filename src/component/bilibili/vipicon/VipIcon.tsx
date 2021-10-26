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
          const borderColor = this.props.isSvip
            ? config.style.svipIcon.borderColor
            : config.style.vipIcon.borderColor;
          const backgroundColor = this.props.isSvip
            ? config.style.svipIcon.backgroundColor
            : config.style.vipIcon.backgroundColor;
          const color = this.props.isSvip
            ? config.style.svipIcon.color
            : config.style.vipIcon.color;
          const text = this.props.isSvip
            ? config.style.svipIcon.text
            : config.style.vipIcon.text;

          return (
            <TextIcon
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              color={color}
            >
              {text}
            </TextIcon>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
