/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { dialog } from "electron";
import { ConfigManager } from "../../config/ConfigManager";
import { getConfigUpdateCommand } from "../../../share/type/commandPack/appCommand/command/TConfigUpdate";
import { GiftConfigGetter } from "../apiRequest/GiftConfigGetter";
import { getGiftConfigUpdateCommand } from "../../../share/type/commandPack/appCommand/command/TGiftConfigUpdate";
import { RoomInitGetter } from "../apiRequest/RoomInitGetter";
import { MasterInfoGetter } from "../apiRequest/MasterInfoGetter";
import { getRoomRealTimeMessageUpdateCommand } from "../../../share/type/commandPack/bilibiliCommand/command/TRoomRealTimeMessageUpdate";
import { DanmuHistoryGetter } from "../apiRequest/DanmuHistoryGetter";
import { getCommandPack } from "../../../share/type/commandPack/TCommandPack";
import { getBiliBiliCommand } from "../../../share/type/commandPack/bilibiliCommand/TBiliBiliCommand";
import { TAnyCommandType } from "../../../share/type/commandPack/TAnyCommandType";
import { getAppCommand } from "../../../share/type/commandPack/appCommand/TAppCommand";
import { TAnyBiliBiliCommand } from "../../../share/type/commandPack/bilibiliCommand/TAnyBiliBiliCommand";
import { TAnyAppCommand } from "../../../share/type/commandPack/appCommand/TAnyAppCommand";
import { CommandHistoryManager } from "../../utils/commandPack/CommandHistoryManager";
import { TBiliBiliPackParseError } from "../../../share/type/commandPack/appCommand/command/TBiliBiliPackParseError";

const get = ConfigManager.get.bind(ConfigManager);
const getConfig = ConfigManager.getConfig.bind(ConfigManager);

export class CommandBroadcastServer {
  static server: WebSocketServer;

  static async onConnection(socket: WebSocket) {
    this.sendAppCommand(socket, getConfigUpdateCommand(getConfig()));
    this.sendAppCommand(
      socket,
      getGiftConfigUpdateCommand(await GiftConfigGetter.get())
    );
    // TODO receiverStatusUpdate
    // this.sendAppCommand(
    //   socket,
    //   getReceiverStatusUpdateCommand(
    //     DanmuReceiver.isOpen()
    //       ? "open"
    //       : DanmuReceiver.isClosed()
    //         ? "close"
    //         : "error"
    //   )
    // );

    const roomid = get("danmuReceiver.roomid") ?? 0;
    const id = await RoomInitGetter.getId(roomid);
    const uid = await RoomInitGetter.getUid(roomid);
    const fansNum = await MasterInfoGetter.getFansNum(uid);

    this.sendBiliBiliCommand(
      socket,
      getRoomRealTimeMessageUpdateCommand(fansNum, 0)
    );

    const danmuHistory = await DanmuHistoryGetter.getDanmuMsgList(id);
    danmuHistory.forEach((value) => {
      this.sendBiliBiliCommand(socket, value);
    });
  }

  static run(server: HttpServer): void {
    this.close();
    this.server = new WebSocketServer({ server });
    this.server.on("connection", this.onConnection.bind(this));
  }

  static sendAppCommand(socket: WebSocket, data: TAnyAppCommand) {
    this.sendCommand(socket, getAppCommand(data));
  }

  static sendBiliBiliCommand(socket: WebSocket, data: TAnyBiliBiliCommand) {
    this.sendCommand(socket, getBiliBiliCommand(data));
  }

  static sendCommand(socket: WebSocket, data: TAnyCommandType): void {
    socket.send(JSON.stringify(getCommandPack(data)));
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

  static broadcastMessage(message: TAnyCommandType): void {
    const commandPack = getCommandPack(message);
    CommandBroadcastServer.broadcast(JSON.stringify(commandPack));
    CommandHistoryManager.writeCommand(commandPack);
  }

  static alertMessage(message: TBiliBiliPackParseError): void {
    dialog.showErrorBox("错误", message.message);
    CommandHistoryManager.writeCommand(getCommandPack(getAppCommand(message)));
  }
}
