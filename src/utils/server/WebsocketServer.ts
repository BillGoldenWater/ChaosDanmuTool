import { Server } from "ws";
import { Server as HttpServer } from "http";
import { getConfigUpdateMessage } from "../command/ConfigUpdate";
import { ConfigManager } from "../config/ConfigManager";
import { getGiftConfigUpdateMessage } from "../command/GiftConfigUpdate";
import { GiftConfigGetter } from "../data/GiftConfigGetter";
import { getStatusUpdateMessage } from "../command/ReceiverStatusUpdate";
import { DanmuReceiver } from "../client/DanmuReceiver";
import { DanmuHistoryGetter } from "../data/DanmuHistoryGetter";
import { getMessageCommand } from "../command/MessageCommand";

export class WebsocketServer {
  static server: Server;

  static run(server: HttpServer): void {
    this.close();
    this.server = new Server({ server });
    this.server.on("connection", (socket) => {
      socket.send(JSON.stringify(getConfigUpdateMessage(ConfigManager.config)));
      socket.send(
        JSON.stringify(
          getGiftConfigUpdateMessage(GiftConfigGetter.giftConfigRes)
        )
      );
      socket.send(
        JSON.stringify(
          getStatusUpdateMessage(
            DanmuReceiver.isOpen()
              ? "open"
              : DanmuReceiver.isClosed()
              ? "close"
              : "error"
          )
        )
      );
      new DanmuHistoryGetter().get(
        ConfigManager.config.danmuReceiver.roomid,
        (history) => {
          history.forEach((value) => {
            socket.send(
              JSON.stringify(getMessageCommand(JSON.stringify(value)))
            );
          });
        }
      );
    });
  }

  static close(): void {
    if (this.server) {
      this.server.clients.forEach((value) => {
        value.close();
      });
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
