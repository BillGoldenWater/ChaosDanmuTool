import React from "react";
import { Button } from "../../../../../component/button/Button";

class Props {}

export class WindowControl extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <div>
        <Button onClick={window.electron.openViewer}>打开</Button>
        <Button onClick={window.electron.closeViewer}>关闭</Button>
      </div>
    );
  }
}
