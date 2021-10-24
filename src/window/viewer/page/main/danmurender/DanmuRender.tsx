import React from "react";
import style from "./DanmuRender.module.css";
import { DanmuItem } from "./danmuitem/DanmuItem";
import { DanmuMessageWithKey } from "../../../../../utils/command/DanmuMessage";

class Props {
  danmuList: DanmuMessageWithKey[];
}

export class DanmuRender extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const danmuItems = this.props.danmuList.map((value) => {
      return <DanmuItem key={value.key} message={value.msg} />;
    });

    return <div className={style.DanmuRender}>{danmuItems}</div>;
  }
}
