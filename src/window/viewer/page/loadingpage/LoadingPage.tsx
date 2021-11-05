import React from "react";
import style from "./LoadingPage.module.css";

export class Props {
  action?: string;
  description?: string;
}

export class LoadingPage extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.LoadingPage}>
        <div className={style.Action}>{this.props.action}</div>
        <div className={style.Description}>{this.props.description}</div>
      </div>
    );
  }
}
