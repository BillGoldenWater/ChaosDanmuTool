export class WebsocketClient {
  client: WebSocket;
  onmessage: (event: MessageEvent) => void;
  onopen: (event: Event) => void;
  onclose: (event: CloseEvent) => void;
  onerror: (event: Event) => void;

  constructor(
    onmessage: (event: MessageEvent) => void,
    onopen: (event: Event) => void,
    onclose: (event: CloseEvent) => void,
    onerror: (event: Event) => void
  ) {
    this.onmessage = onmessage;
    this.onopen = onopen;
    this.onclose = onclose;
    this.onerror = onerror;
  }

  connect(host: string, port: number): void {
    this.close();

    this.client = new WebSocket(
      "ws://" + (host && host != "" ? host : "localhost") + ":" + port
    );
    this.client.onmessage = this.onmessage;
    this.client.onopen = this.onopen;
    this.client.onclose = this.onclose;
    this.client.onerror = this.onerror;
  }

  close(): void {
    if (this.client) {
      this.client.close(1000);
      this.client = null;
    }
  }
}
