import React from "react";
import { LoadingPage } from "../../../component/loadingpage/LoadingPage";

export class Main extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        a
        <LoadingPage action={"连接中"} />
      </div>
    );
  }
}
