const DataOffset = {
  packageLength: 0,
  headerLength: 4,
  dataType: 6,
  opCode: 8,
  sequenceId: 12,
  body: 16,
};

const DataType = {
  json: 0,
  int32: 1,
  compressedZlib: 2,
  compressedBrotli: 3,
};

const OpCode = {
  heartbeat: 2,
  heartbeatResponse: 3,
  message: 5,
  join: 7,
  joinResponse: 8,
};

export class Data {
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

  static join(roomId: number, protocolVersion: number, platform: string): Data {
    return new Data(
      this.encodeString(
        JSON.stringify({
          roomid: roomId,
          protover: protocolVersion,
          platform: platform,
        })
      ),
      OpCode.join
    );
  }

  static heartBeat(): Data {
    return new Data(new DataView(new ArrayBuffer(0)), OpCode.heartbeat);
  }

  static encodeString(str: string): DataView {
    const encoder = new TextEncoder();
    return new DataView(encoder.encode(str).buffer);
  }

  static decodeString(data: DataView): string {
    const decoder = new TextDecoder();
    return decoder.decode(data.buffer);
  }
}

export class DanmuReceiver {
  static connection: WebSocket;

  static connect(url: string, onopen?: () => void): void {
    this.connection = new WebSocket(url);

    this.connection.onopen = () => {
      this.connection.send(this.pack(Data.join(732602, 3, "web")));
      onopen ? onopen() : "";
    };

    this.connection.onmessage = (event) => {
      console.log(event.data);
    };
  }

  static pack(data: Data): DataView {
    const result = new DataView(new ArrayBuffer(data.getPacketLength()));

    result.setUint32(DataOffset.packageLength, data.getPacketLength(), false);
    result.setUint16(DataOffset.headerLength, data.getHeaderLength(), false);
    result.setUint16(DataOffset.dataType, data.getDataType(), false);
    result.setUint32(DataOffset.opCode, data.getOpCode(), false);
    result.setUint32(DataOffset.sequenceId, 1, false);

    const body = data.getBody();
    for (let i = 0; i < body.byteLength; i++) {
      result.setUint8(DataOffset.body + i, body.getUint8(i));
    }

    return result;
  }
}
