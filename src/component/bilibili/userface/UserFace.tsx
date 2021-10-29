import React from "react";
import style from "./UserFace.module.css";

class Props {
  face?: string;
}

export class UserFace extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div className={style.UserFace}>
        <img className={style.UserFace_face} src={this.props.face} alt={""} />
      </div>
    );
  }
}
