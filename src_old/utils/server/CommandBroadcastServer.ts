/*
 * Copyright 2021-2022 Golden_Water
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
import { getMessageLogMessage } from "../../command/messagelog/MessageLog";
import { ErrorMessage } from "../../command/messagelog/ErrorMessage";
import { dialog } from "electron";
import { TAnyMessage } from "../../type/TAnyMessage";
import { CommandHistoryManager } from "../history/CommandHistoryManager";
import { MasterInfoGetter } from "../data/MasterInfoGetter";
import { RoomInitGetter } from "../data/RoomInitGetter";
import { TRoomRealTimeMessageUpdate } from "../../type/bilibili/TRoomRealTimeMessageUpdate";

const get = ConfigManager.get.bind(ConfigManager);
const getConfig = ConfigManager.getConfig.bind(ConfigManager);

export class CommandBroadcastServer {
  static server: WebSocketServer;

  static run(server: HttpServer): void {
    this.close();
    this.server = new WebSocketServer({ server });
    this.server.on("connection", async (socket) => {
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

      const roomid = get("danmuReceiver.roomid");
      if (roomid == null) return;
      const id = await RoomInitGetter.getId(roomid);
      const uid = await RoomInitGetter.getUid(roomid);
      const fansNum = await MasterInfoGetter.getFansNum(uid);

      const roomRealTimeMessageUpdate: TRoomRealTimeMessageUpdate = {
        cmd: "ROOM_REAL_TIME_MESSAGE_UPDATE",
        data: {
          roomid: id,
          fans: fansNum,
          red_notice: 0,
          fans_club: -1,
        },
      };
      this.sendMessage(socket, getMessageCommand(roomRealTimeMessageUpdate));

      new DanmuHistoryGetter().get(id, (history) => {
        history.forEach((value) => {
          this.sendMessage(socket, getMessageCommand(value));
        });
      });
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
    CommandHistoryManager.writeCommand(messageLog);
  }

  static alertMessage(message: ErrorMessage): void {
    dialog.showErrorBox("错误", message["data"]["errorMessage"]);
    CommandHistoryManager.writeCommand(getMessageLogMessage(message));
  }
}
