import React from "react";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import style from "./Function.module.css";
import { ConnectControl } from "./connectcontrol/ConnectControl";

export class Function extends React.Component {
  render(): JSX.Element {
    return (
      <div className={style.function}>
        <FunctionCard className={""} name={"直播间连接"}>
          <ConnectControl />
        </FunctionCard>
      </div>
    );
  }
}
