import React from "react";
import style from "./FunctionCard.module.css";

class Props {
  className?: string;
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
        {this.props.children}
      </div>
    );
  }
}
