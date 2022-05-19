/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import WebSocket from "ws";
import Zlib from "zlib";
import { CommandBroadcastServer as CBS } from "../../server/CommandBroadcastServer";
import { ConfigManager as Config } from "../../../config/ConfigManager";
import {
  getReceiverStatusUpdateCommand,
  TReceiverStatus,
} from "../../../../share/type/commandPack/appCommand/command/TReceiverStatusUpdate";
import { createViewerWindow, isExists, viewerWindow } from "../../../index";
import { printError } from "../../../../share/utils/ErrorUtils";
import { getBiliBiliPackParseErrorCommand } from "../../../../share/type/commandPack/appCommand/command/TBiliBiliPackParseError";
import { getActivityUpdateCommand } from "../../../../share/type/commandPack/bilibiliCommand/command/TActivityUpdate";
import { dialog } from "electron";
import { CommandHistoryManager } from "../../../utils/commandPack/CommandHistoryManager";
import { getCommandPack } from "../../../../share/type/commandPack/TCommandPack";
import { getAppCommand } from "../../../../share/type/commandPack/appCommand/TAppCommand";
import { DataOffset } from "./DDataOffset";
import { DataType } from "./DDataType";
import { OpCode } from "./DOpCode";
import { Packet } from "./Packet";
import { decodeString } from "../../../utils/StringUtils";
import { RoomInfoGetter } from "../../apiRequest/RoomInfoGetter";
import { DanmuServerInfoGetter } from "../../apiRequest/DanmuServerInfoGetter";

function alertPacketParseError(message: string, data: Packet): void {
  dialog.showErrorBox("错误", message);
  CommandHistoryManager.writeCommand(
    getCommandPack(
      getAppCommand(getBiliBiliPackParseErrorCommand(message, data))
    )
  );
}

export class DanmuReceiver {
  static connection: WebSocket;
  static heartBeatId: NodeJS.Timer;
  static heartBeatInterval: number;
  static reconnectTimeout: NodeJS.Timeout;
  static reconnectCount = 0;
  static status: TReceiverStatus = "close";

  static tryReconnect(
    roomid: number,
    heartBeatInterval: number,
    protocolVersion?: number,
    platform?: string
  ) {
    if (Config.get("danmuReceiver.autoReconnect") && this.reconnectCount <= 5) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectCount++;
        this.connect(roomid, heartBeatInterval, protocolVersion, platform);
      }, 1e3);
      this.broadcastStatusUpdate("reconnecting");
    }
  }

  static broadcastStatusUpdate(status: TReceiverStatus) {
    this.status = status;
    CBS.broadcastAppCommand(getReceiverStatusUpdateCommand(status));
  }

  static async connect(
    roomid: number,
    heartBeatInterval: number,
    protocolVersion?: number,
    platform?: string
  ) {
    this.close();
    this.heartBeatInterval = heartBeatInterval;

    const actualRoomid = await RoomInfoGetter.getId(roomid);
    const tokenAndUrl = await DanmuServerInfoGetter.getTokenAndAUrl(
      actualRoomid
    );
    this.connection = new WebSocket(tokenAndUrl.url);
    this.connection.binaryType = "arraybuffer";

    this.broadcastStatusUpdate("connecting");

    this.connection.on("open", () => {
      this.connection.send(
        this.pack(
          Packet.join(
            roomid,
            protocolVersion ? protocolVersion : 3,
            platform ? platform : "web",
            tokenAndUrl.token
          )
        )
      );
      this.startHeartBeat();

      this.broadcastStatusUpdate("open");

      if (
        Config.get("danmuViewConfig.autoOpenWhenConnect") &&
        !isExists(viewerWindow)
      ) {
        createViewerWindow().then();
      }

      this.reconnectCount = 0;
    });

    this.connection.on("close", (code) => {
      this.broadcastStatusUpdate("close");
      if (code == 1006) {
        this.tryReconnect(roomid, heartBeatInterval, protocolVersion, platform);
      }
    });

    this.connection.on("error", (err) => {
      printError("DanmuReceiver.connection.onError", err);
      this.broadcastStatusUpdate("error");
    });

    this.connection.on("message", this.onMessage.bind(this));
  }

  static async onMessage(data: ArrayBuffer): Promise<void> {
    const dataList = this.unpackCompressed(this.unpack(new DataView(data)));
    dataList.forEach((value) => {
      this.parsePacket(value);
    });
  }

  static parsePacket(packet: Packet): void {
    if (packet.getDataType() != DataType.json) {
      const message = `dataTypeIncorrect: ${packet.getDataType()}\nDanmuReceiver.parsePacket`;
      alertPacketParseError(message, packet);
      return;
    }
    switch (packet.getOpCode()) {
      case OpCode.heartbeatResponse: {
        const activity = packet.getBody().getInt32(0, false);
        const message = getActivityUpdateCommand(activity);
        CBS.broadcastBiliBiliCommand(message);
        break;
      }
      case OpCode.joinResponse: {
        const responseBody = JSON.parse(decodeString(packet.getBody()));
        if (responseBody["code"] !== 0) {
          const message = ``;
          alertPacketParseError(message, packet);
        }
        break;
      }
      case OpCode.message: {
        const message = decodeString(packet.getBody());
        CBS.broadcastBiliBiliCommand(JSON.parse(message));
        break;
      }
      default: {
        const message = `unknownOpCode: ${packet.getOpCode()}\nDanmuReceiver.parsePacket`;
        alertPacketParseError(message, packet);
        break;
      }
    }
  }

  static startHeartBeat(): void {
    this.heartBeatId = setInterval(() => {
      this.connection.send(this.pack(Packet.heartBeat()));
    }, this.heartBeatInterval * 1000);
  }

  static stopHeartBeat(): void {
    clearInterval(this.heartBeatId);
    this.heartBeatId = null;
  }

  static close(): boolean {
    if (this.connection) {
      if (this.connection.readyState != WebSocket.CLOSED) {
        if (this.connection.readyState == WebSocket.OPEN) {
          this.connection.close(1000);
        } else {
          this.connection.terminate();
        }
      }
    }
    this.heartBeatId ? this.stopHeartBeat() : "";
    return true;
  }

  static isConnecting(): boolean {
    return (
      this.connection &&
      this.connection.readyState == this.connection.CONNECTING
    );
  }

  static isOpen(): boolean {
    return (
      this.connection && this.connection.readyState == this.connection.OPEN
    );
  }

  static isClosing(): boolean {
    return (
      this.connection && this.connection.readyState == this.connection.CLOSING
    );
  }

  static isClosed(): boolean {
    if (this.connection) {
      return this.connection.readyState == this.connection.CLOSED;
    } else {
      return true;
    }
  }

  static pack(data: Packet): DataView {
    const result = new DataView(new ArrayBuffer(data.getPacketLength()));

    result.setUint32(DataOffset.packetLength, data.getPacketLength());
    result.setUint16(DataOffset.headerLength, data.getHeaderLength());
    result.setUint16(DataOffset.dataType, data.getDataType());
    result.setUint32(DataOffset.opCode, data.getOpCode());
    result.setUint32(DataOffset.sequenceId, 1);

    const body = data.getBody();
    for (let i = 0; i < body.byteLength; i++) {
      result.setUint8(DataOffset.body + i, body.getUint8(i));
    }

    return result;
  }

  static unpack(dataView: DataView, offset?: number): Packet {
    const dataOffset = offset ? offset : 0;
    const packetLength = dataView.getUint32(
      DataOffset.packetLength + dataOffset
    );
    const headerLength = dataView.getInt16(
      DataOffset.headerLength + dataOffset
    );
    const dataType = dataView.getInt16(DataOffset.dataType + dataOffset);
    const opCode = dataView.getUint32(DataOffset.opCode + dataOffset);

    const bodyLength = packetLength - headerLength;
    const body = new DataView(new ArrayBuffer(bodyLength));
    for (let i = 0; i < bodyLength; i++) {
      body.setUint8(i, dataView.getUint8(DataOffset.body + i + dataOffset));
    }

    return new Packet(body, opCode, dataType);
  }

  static unpackContinuous(dataView: DataView): Packet[] {
    const dataArray: Packet[] = [];
    let data: Packet = this.unpack(dataView);

    dataArray.push(data);

    let dataLength = data.getPacketLength();
    while (dataLength < dataView.byteLength) {
      data = this.unpack(dataView, dataLength);
      dataLength += data.getPacketLength();
      dataArray.push(data);
    }

    return dataArray;
  }

  static unpackCompressed(data: Packet): Packet[] {
    switch (data.getDataType()) {
      case DataType.compressedZlib: {
        const decompressedData = Zlib.inflateSync(data.getBody());
        return this.unpackContinuous(
          new DataView(decompressedData.buffer, 0, decompressedData.byteLength)
        );
      }
      case DataType.compressedBrotli: {
        const decompressedData = Zlib.brotliDecompressSync(data.getBody());
        return this.unpackContinuous(
          new DataView(decompressedData.buffer, 0, decompressedData.byteLength)
        );
      }
      default: {
        return [data];
      }
    }
  }
}
