/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { getConfigUpdateMessage } from "../../command/ConfigUpdate";
import { ConfigManager } from "../config/ConfigManager";
import { getGiftConfigUpdateMessage } from "../../command/GiftConfigUpdate";
import { GiftConfigGetter } from "../data/GiftConfigGetter";
import { getStatusUpdateMessage } from "../../command/ReceiverStatusUpdate";
import { DanmuReceiver } from "../client/DanmuReceiver";
import { DanmuHistoryGetter } from "../data/DanmuHistoryGetter";
import { getMessageCommand } from "../../command/MessageCommand";
import {
  getMessageLogMessage,
  MessageLog,
} from "../../command/messagelog/MessageLog";
import { ErrorMessage } from "../../command/messagelog/ErrorMessage";
import { dialog } from "electron";
import { TAnyMessage } from "../../type/TAnyMessage";

const get = ConfigManager.get.bind(ConfigManager);
const getConfig = ConfigManager.getConfig.bind(ConfigManager);

export class CommandBroadcastServer {
  static server: WebSocketServer;
  static messageHistory: MessageLog<TAnyMessage>[];

  static run(server: HttpServer): void {
    this.close();
    this.messageHistory = [];

    this.server = new WebSocketServer({ server });
    this.server.on("connection", (socket) => {
      this.sendMessage(socket, getConfigUpdateMessage(getConfig()));
      this.sendMessage(
        socket,
        getGiftConfigUpdateMessage(GiftConfigGetter.giftConfigRes)
      );
      this.sendMessage(
        socket,
        getStatusUpdateMessage(
          DanmuReceiver.isOpen()
            ? "open"
            : DanmuReceiver.isClosed()
            ? "close"
            : "error"
        )
      );
      if (get("danmuReceiver.roomid") != null) {
        new DanmuHistoryGetter().get(
          get("danmuReceiver.roomid") as number,
          (history) => {
            history.forEach((value) => {
              this.sendMessage(socket, getMessageCommand(value));
            });
          }
        );
      }
    });
  }

  static sendMessage(socket: WebSocket.WebSocket, data: TAnyMessage): void {
    socket.send(JSON.stringify(getMessageLogMessage(data)));
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

  static broadcastMessage(message: TAnyMessage): void {
    const messageLog = getMessageLogMessage(message);
    CommandBroadcastServer.broadcast(JSON.stringify(messageLog));
    this.messageHistory.push(messageLog);
  }

  static alertMessage(message: ErrorMessage): void {
    dialog.showErrorBox("错误", message["data"]["errorMessage"]);
    this.messageHistory.push(getMessageLogMessage(message));
  }

  static getMessageHistory(): MessageLog<TAnyMessage>[] {
    return this.messageHistory;
  }
}
