import React from "react";
import style from "./FunctionCard.module.css";

class Props {
  className?: string;
  name?: string;
  description?: string;
}

export class FunctionCard extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div
        className={
          style.functionCard +
          (this.props.className ? " " + this.props.className : "")
        }
      >
        <div className={style.functionCard_name}>
          <h5>{this.props.name}</h5>
        </div>
        <div className={style.functionCard_description}>
          {this.props.description}
        </div>
        {this.props.children}
      </div>
    );
  }
}
