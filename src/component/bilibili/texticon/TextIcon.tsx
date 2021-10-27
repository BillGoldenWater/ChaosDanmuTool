import React from "react";
import style from "./TextIcon.module.css";

class Props {
  style?: React.CSSProperties;
}

export class TextIcon extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.TextIcon}>
        <div style={this.props.style}>{this.props.children}</div>
      </div>
    );
  }
}
