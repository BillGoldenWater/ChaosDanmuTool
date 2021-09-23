import { Server } from "ws";
import { ConfigManager } from "./ConfigManager";

export class WebsocketServer {
  static server: Server;

  static run(host: string, port: number): void {
    this.close();
    this.server = new Server({
      host: host,
      port: port,
    });
    this.server.on("connection", (socket) => {
      socket.send(
        JSON.stringify({
          cmd: "updateConfig",
          data: ConfigManager.config,
        })
      );
    });
  }

  static close(): void {
    if (this.server) {
      this.server.close();
    }
    this.server = null;
  }

  static broadcast(data: string): void {
    if (this.server) {
      this.server.clients.forEach((value) => {
        value.send(data);
      });
    }
  }
}
