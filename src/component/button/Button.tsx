import React from "react";
import style from "./Button.module.css";

class Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
}

export class Button extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <button
        className={
          style.Button +
          (this.props.className ? " " + this.props.className : "")
        }
        style={this.props.style}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}
