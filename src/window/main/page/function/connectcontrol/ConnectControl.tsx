import React from "react";

export class ConnectControl extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <button
          onClick={() => {
            window.electron.connectToServer();
          }}
        >
          连接服务器
        </button>
        <button>启动服务器</button>
      </div>
    );
  }
}
