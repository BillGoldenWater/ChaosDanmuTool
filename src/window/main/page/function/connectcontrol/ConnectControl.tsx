import React from "react";
import { ConnectManager } from "../../../../../utils/ConnectManager";

export class ConnectControl extends React.Component {
  render() {
    return (
      <div>
        <button
          onClick={() => {
            ConnectManager.connectToServer();
          }}
        >
          连接服务器
        </button>
        <button
          onClick={() => {
            console.log(ConnectManager.isReceiverConnected());
          }}
        >
          启动服务器
        </button>
      </div>
    );
  }
}
