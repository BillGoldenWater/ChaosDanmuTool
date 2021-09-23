export class WebsocketClient {
  client: WebSocket;
  onmessage: (event: MessageEvent) => void;

  constructor(onmessage: (event: MessageEvent) => void) {
    this.onmessage = onmessage;
  }

  connect(host: string, port: number): void {
    this.close();

    this.client = new WebSocket(
      "ws://" + (host && host != "" ? host : "localhost") + ":" + port
    );
    this.client.onmessage = this.onmessage;
  }

  close(): void {
    if (this.client) {
      this.client.close(0);
      this.client = null;
    }
  }
}
