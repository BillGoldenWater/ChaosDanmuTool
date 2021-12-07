import { CSSProperties } from "react";

export type DanmuReceiverConfig = {
  serverUrl: string;
  roomid: number;
  heartBeatInterval: number;
};

export type DanmuViewConfig = {
  autoOpenWhenConnect: boolean;
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

export type DanmuToSpeechConfig = {
  speakUserName: boolean;
  filterDuplicateContentDelay: number;
};

export type TextToSpeechConfig = {
  enable: boolean;
  maxPlayListItemNum: number;

  danmu: DanmuToSpeechConfig;
};

export type DanmuViewCustomConfig = {
  name: string;
  maxDanmuNumber: number;
  statusBarDisplay: boolean;
  superChatAlwaysOnTop: boolean;
  numberFormat: NumberFormatConfig;
  tts: TextToSpeechConfig;
  style: DanmuViewStyleConfig;
};

export type Config = {
  forChaosDanmuTool: boolean;
  autoSaveOnQuit: boolean;
  autoSaveOnChange: boolean;
  httpServerPort: number;
  darkTheme: boolean;
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
  tts: {
    enable: false,
    maxPlayListItemNum: 2,
    danmu: {
      speakUserName: false,
      filterDuplicateContentDelay: 30,
    },
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
      color: "#ffffff",
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

export const defaultViewCustomInternalName = "内置弹幕查看器";
export const defaultViewCustomOtherName = "其他";

export const defaultConfig: Config = {
  forChaosDanmuTool: true,
  autoSaveOnQuit: true,
  autoSaveOnChange: true,
  httpServerPort: 25555,
  darkTheme: true,
  danmuReceiver: {
    serverUrl: "wss://broadcastlv.chat.bilibili.com/sub",
    roomid: 0,
    heartBeatInterval: 30,
  },
  danmuViewConfig: {
    autoOpenWhenConnect: true,
    maxReconnectAttemptNumber: 5,
    width: 400,
    height: 600,
    posX: 0,
    posY: 0,
  },
  danmuViewCustoms: [
    {
      ...defaultDanmuViewCustom,
      name: defaultViewCustomInternalName,
      tts: {
        ...defaultDanmuViewCustom.tts,
        enable: true,
      },
    },
    {
      ...defaultDanmuViewCustom,
      name: defaultViewCustomOtherName,
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

export function getDefaultConfig(config?: Config): Config {
  if (!config) return { ...defaultConfig };

  return {
    ...defaultConfig,
    ...config,
    danmuReceiver: { ...defaultConfig.danmuReceiver, ...config.danmuReceiver },
    danmuViewConfig: {
      ...defaultConfig.danmuViewConfig,
      ...config.danmuViewConfig,
    },
  };
}

export function getDefaultDanmuViewCustomConfig(
  danmuViewCustomConfig?: DanmuViewCustomConfig
): DanmuViewCustomConfig {
  if (!danmuViewCustomConfig) return { ...defaultDanmuViewCustom };

  return {
    ...defaultDanmuViewCustom,
    ...danmuViewCustomConfig,
    tts: {
      ...defaultDanmuViewCustom.tts,
      ...danmuViewCustomConfig.tts,
    },
    style: {
      ...defaultDanmuViewCustom.style,
      ...danmuViewCustomConfig.style,
    },
  };
}
