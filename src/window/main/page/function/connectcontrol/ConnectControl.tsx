import React from "react";

class Props {}

class State {
  isOpen: boolean;
}

export class ConnectControl extends React.Component<Props, State> {
  constructor(props: never) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  render(): JSX.Element {
    return (
      <div>
        <button
          onClick={() => {
            window.electron.connect(123456789);
          }}
          style={{
            backgroundColor: this.state.isOpen ? "green" : "red",
          }}
        >
          连接服务器
        </button>
        <button
          onClick={() => {
            window.electron.disconnect();
          }}
        >
          启动服务器
        </button>
      </div>
    );
  }
}
