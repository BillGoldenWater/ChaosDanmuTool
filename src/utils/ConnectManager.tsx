export class ConnectManager {
  static receiver: WebSocket;
  static server: WebSocket;

  static connectToServer(): void {
    ConnectManager.receiver = new WebSocket(
      "wss://broadcastlv.chat.bilibili.com/sub"
    );
    console.log("connect to server");
  }

  static startServer(): void {
    console.log("start server");
  }

  static isReceiverConnected(): WebSocket {
    return this.receiver;
    // return !!(this.receiver != null && this.receiver.OPEN);
  }
}
