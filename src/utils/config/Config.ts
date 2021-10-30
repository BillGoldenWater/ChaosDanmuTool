import { CSSProperties } from "react";

export type DanmuReceiverConfig = {
  serverUrl: string;
  roomid: number;
  heartBeatInterval: number;
};

export type WebsocketServerConfig = {
  host: string;
  port: number;
};

export type WebServerConfig = {
  port: number;
};

export type DanmuViewConfig = {
  websocketServer: WebsocketServerConfig;
  webServer: WebServerConfig;
  maxReconnectAttemptNumber: number;
  width: number;
  height: number;
  posX: number;
  posY: number;
};

export type NumberFormatConfig = {
  formatActivity: boolean;
  formatFansNum: boolean;
};

export type TextIconStyleConfig = {
  text: string;
  style: CSSProperties;
};

export type TextStyleConfig = {
  color: string;
};

export type DanmuViewStyleConfig = {
  listMargin: string;
  mainStyle: CSSProperties;
  giftIcon: CSSProperties;
  vipIcon: TextIconStyleConfig;
  svipIcon: TextIconStyleConfig;
  adminIcon: TextIconStyleConfig;
  userName: CSSProperties;
  danmuContent: CSSProperties;
};

export type DanmuViewCustomConfig = {
  name: string;
  maxDanmuNumber: number;
  statusBarDisplay: boolean;
  superChatAlwaysOnTop: boolean;
  numberFormat: NumberFormatConfig;
  style: DanmuViewStyleConfig;
};

export type Config = {
  forChaosDanmuTool: boolean;
  danmuReceiver: DanmuReceiverConfig;
  danmuViewConfig: DanmuViewConfig;
  danmuViewCustoms: DanmuViewCustomConfig[];
};

export const defaultDanmuViewCustom: DanmuViewCustomConfig = {
  name: "",
  maxDanmuNumber: 100,
  statusBarDisplay: true,
  superChatAlwaysOnTop: true,
  numberFormat: {
    formatActivity: true,
    formatFansNum: true,
  },
  style: {
    listMargin: "0.25em",
    mainStyle: {
      backgroundColor: "#3B3B3B44",
      zoom: 1.0,
      fontSize: "4.5vw",
      fontFamily: "",
      fontWeight: 400,
      lineHeight: "1.5em",
      color: "#fff",
    },
    giftIcon: {
      height: "2em",
    },
    vipIcon: {
      text: "爷",
      style: {
        color: "#FFFFFF",
        backgroundColor: "#DC6385",
        borderColor: "#BC5573",
      },
    },
    svipIcon: {
      text: "爷",
      style: {
        color: "#FFFFFF",
        backgroundColor: "#E8B800",
        borderColor: "#DE8402",
      },
    },
    adminIcon: {
      text: "房",
      style: {
        color: "#FFFFFF",
        backgroundColor: "#D2A25B",
        borderColor: "#DE8402",
      },
    },
    userName: {
      color: "#00AAFF",
    },
    danmuContent: {
      color: "#FFFFFF",
    },
  },
};

export const defaultConfig: Config = {
  forChaosDanmuTool: true,
  danmuReceiver: {
    serverUrl: "wss://broadcastlv.chat.bilibili.com/sub",
    roomid: 0,
    heartBeatInterval: 30,
  },
  danmuViewConfig: {
    websocketServer: {
      host: "localhost",
      port: 25555,
    },
    webServer: {
      port: 25556,
    },
    maxReconnectAttemptNumber: 5,
    width: 400,
    height: 600,
    posX: 0,
    posY: 0,
  },
  danmuViewCustoms: [
    {
      ...defaultDanmuViewCustom,
      name: "internal",
    },
    {
      ...defaultDanmuViewCustom,
      name: "other",
      style: {
        ...defaultDanmuViewCustom.style,
        mainStyle: {
          ...defaultDanmuViewCustom.style.mainStyle,
          backgroundColor: "#000000AA",
        },
      },
      numberFormat: {
        formatActivity: false,
        formatFansNum: false,
      },
    },
  ],
};
