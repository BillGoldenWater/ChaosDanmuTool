import React from "react";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";
import { TextIcon } from "../texticon/TextIcon";

export class AdminIcon extends React.Component {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <TextIcon style={config.style.adminIcon.style}>
            {config.style.adminIcon.text}
          </TextIcon>
        )}
      </ConfigContext.Consumer>
    );
  }
}
