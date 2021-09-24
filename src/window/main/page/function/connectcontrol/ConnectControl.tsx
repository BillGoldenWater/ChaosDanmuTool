import React from "react";
import { Button } from "../../../../../component/button/Button";

class Props {}

export class ConnectControl extends React.Component<Props> {
  constructor(props: never) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        房间号:
        <input
          style={{
            padding: "0.3em",
          }}
        />
        <Button>连接</Button>
      </div>
    );
  }
}
