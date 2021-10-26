import React from "react";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";

class Props {
  name: string;
}

export class UserName extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <div
            style={{
              color: config.style.userName.color,
            }}
          >
            {this.props.name}
          </div>
        )}
      </ConfigContext.Consumer>
    );
  }
}
