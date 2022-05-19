/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DataType } from "./DDataType";
import { OpCode } from "./DOpCode";
import { encodeString } from "../../../utils/StringUtils";

export class Packet {
  private readonly packetLength: number;
  private readonly headerLength: number;
  private readonly dataType: number;
  private readonly opCode: number;
  private readonly body: DataView;
  private readonly bodyLength: number;

  constructor(body: DataView, opCode: number, dataType?: number) {
    this.headerLength = 4 + 2 + 2 + 4 + 4;
    this.packetLength = body.byteLength + this.headerLength;
    this.dataType = dataType ? dataType : DataType.json;
    this.opCode = opCode;
    this.body = body;
    this.bodyLength = body.byteLength;
  }

  getPacketLength(): number {
    return this.packetLength;
  }

  getHeaderLength(): number {
    return this.headerLength;
  }

  getDataType(): number {
    return this.dataType;
  }

  getOpCode(): number {
    return this.opCode;
  }

  getBody(): DataView {
    return this.body;
  }

  static join(
    roomId: number,
    protocolVersion: number,
    platform: string,
    token: string
  ): Packet {
    return new Packet(
      encodeString(
        JSON.stringify({
          roomid: roomId,
          protover: protocolVersion,
          platform: platform,
          key: token,
        })
      ),
      OpCode.join
    );
  }

  static heartBeat(): Packet {
    return new Packet(new DataView(new ArrayBuffer(0)), OpCode.heartbeat);
  }
}
