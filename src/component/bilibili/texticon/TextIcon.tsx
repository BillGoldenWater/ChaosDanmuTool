import React from "react";
import style from "./TextIcon.module.css";

class Props {
  borderColor?: string;
  backgroundColor?: string;
  color?: string;
}

export class TextIcon extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div
        className={style.TextIcon}
        style={{
          borderColor: this.props.borderColor,
          backgroundColor: this.props.backgroundColor,
          color: this.props.color,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
