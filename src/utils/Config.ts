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
  color: string;
  backgroundColor: string;
  borderColor: string;
};

export type TextStyleConfig = {
  color: string;
};

export type DanmuViewStyleConfig = {
  bodyMargin: string;
  listMargin: string;
  backgroundColor: string;
  zoom: number;
  fontFamily: string;
  fontWeight: string;
  lineSpacing: string;
  giftIconMaxHeight: string;
  vipIcon: TextIconStyleConfig;
  svipIcon: TextIconStyleConfig;
  adminIcon: TextIconStyleConfig;
  userName: TextStyleConfig;
  danmuContent: TextStyleConfig;
};

export type DanmuViewCustomConfig = {
  name: string;
  statusBarDisplay: boolean;
  maxDanmuNumber: number;
  numberFormat: NumberFormatConfig;
  style: DanmuViewStyleConfig;
};

export type Config = {
  danmuReceiver: DanmuReceiverConfig;
  danmuViewConfig: DanmuViewConfig;
  danmuViewCustoms: DanmuViewCustomConfig[];
};

const defaultDanmuViewCustom: DanmuViewCustomConfig = {
  name: "",
  statusBarDisplay: true,
  maxDanmuNumber: 100,
  numberFormat: {
    formatActivity: true,
    formatFansNum: true,
  },
  style: {
    bodyMargin: "0em",
    listMargin: "0.25em",
    backgroundColor: "#3B3B3B44",
    zoom: 1.0,
    fontFamily: "",
    fontWeight: "400",
    lineSpacing: "0.25em",
    giftIconMaxHeight: "3em",
    vipIcon: {
      text: "爷",
      color: "#FFFFFF",
      backgroundColor: "#e601ff",
      borderColor: "#a302b6",
    },
    svipIcon: {
      text: "爷",
      color: "#FFFFFF",
      backgroundColor: "#ffd700",
      borderColor: "#bb9700",
    },
    adminIcon: {
      text: "房",
      color: "#FFFFFF",
      backgroundColor: "#D2A25B",
      borderColor: "#DE8402",
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
        backgroundColor: "#000000AA",
      },
      numberFormat: {
        formatActivity: false,
        formatFansNum: false,
      },
    },
  ],
};
