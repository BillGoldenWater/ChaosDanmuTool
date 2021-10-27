import React from "react";
import style from "./UserName.module.css";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";

class Props {
  name: string;
}

export class UserName extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <div className={style.UserName} style={config.style.userName}>
            {this.props.name}
          </div>
        )}
      </ConfigContext.Consumer>
    );
  }
}
