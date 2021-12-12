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

const defaultDanmuViewCustom: DanmuViewCustomConfig = {
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

const defaultConfig: Config = {
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

  const result: Config = { ...defaultConfig };

  result.forChaosDanmuTool =
    config.forChaosDanmuTool != null
      ? config.forChaosDanmuTool
      : result.forChaosDanmuTool;
  result.autoSaveOnQuit =
    config.autoSaveOnQuit != null
      ? config.autoSaveOnQuit
      : result.autoSaveOnQuit;
  result.autoSaveOnChange =
    config.autoSaveOnChange != null
      ? config.autoSaveOnChange
      : result.autoSaveOnChange;
  result.httpServerPort =
    config.httpServerPort != null
      ? config.httpServerPort
      : result.httpServerPort;
  result.darkTheme =
    config.darkTheme != null ? config.darkTheme : result.darkTheme;

  if (config.danmuReceiver != null && typeof config.danmuReceiver == "object") {
    const rDr = result.danmuReceiver;
    const cdr = config.danmuReceiver;

    rDr.serverUrl = cdr.serverUrl != null ? cdr.serverUrl : rDr.serverUrl;
    rDr.roomid = cdr.roomid != null ? cdr.roomid : rDr.roomid;
    rDr.heartBeatInterval =
      cdr.heartBeatInterval != null
        ? cdr.heartBeatInterval
        : rDr.heartBeatInterval;
  }

  if (
    config.danmuViewConfig != null &&
    typeof config.danmuViewConfig == "object"
  ) {
    const rDvc = result.danmuViewConfig;
    const cDvc = config.danmuViewConfig;

    rDvc.autoOpenWhenConnect =
      cDvc.autoOpenWhenConnect != null
        ? cDvc.autoOpenWhenConnect
        : rDvc.autoOpenWhenConnect;
    rDvc.maxReconnectAttemptNumber =
      cDvc.maxReconnectAttemptNumber != null
        ? cDvc.maxReconnectAttemptNumber
        : rDvc.maxReconnectAttemptNumber;
    rDvc.width = cDvc.width != null ? cDvc.width : rDvc.width;
    rDvc.height = cDvc.height != null ? cDvc.height : rDvc.height;
    rDvc.posX = cDvc.posX != null ? cDvc.posX : rDvc.posX;
    rDvc.posY = cDvc.posY != null ? cDvc.posY : rDvc.posY;
  }

  if (
    config.danmuViewCustoms != null &&
    typeof config.danmuViewCustoms == "object" &&
    config.danmuViewCustoms.length > 0
  ) {
    result.danmuViewCustoms = config.danmuViewCustoms;

    for (const i in result.danmuViewCustoms) {
      result.danmuViewCustoms[i] = getDefaultDanmuViewCustomConfig(
        result.danmuViewCustoms[i]
      );
    }
  }

  return result;
}

export function getDefaultDanmuViewCustomConfig(
  config?: DanmuViewCustomConfig
): DanmuViewCustomConfig {
  if (!config) return { ...defaultDanmuViewCustom };

  const result: DanmuViewCustomConfig = { ...defaultDanmuViewCustom };

  result.name = config.name != null ? config.name : result.name;
  result.maxDanmuNumber =
    config.maxDanmuNumber != null
      ? config.maxDanmuNumber
      : result.maxDanmuNumber;
  result.statusBarDisplay =
    config.statusBarDisplay != null
      ? config.statusBarDisplay
      : result.statusBarDisplay;
  result.superChatAlwaysOnTop =
    config.superChatAlwaysOnTop != null
      ? config.superChatAlwaysOnTop
      : result.superChatAlwaysOnTop;

  if (config.numberFormat != null && typeof config.numberFormat == "object") {
    const rNf = result.numberFormat;
    const cNf = config.numberFormat;

    rNf.formatActivity =
      cNf.formatActivity != null ? cNf.formatActivity : rNf.formatActivity;

    rNf.formatFansNum =
      cNf.formatFansNum != null ? cNf.formatFansNum : rNf.formatFansNum;
  }

  if (config.tts != null && typeof config.tts == "object") {
    const rT = result.tts;
    const cT = config.tts;

    rT.enable = cT.enable != null ? cT.enable : rT.enable;
    rT.maxPlayListItemNum =
      cT.maxPlayListItemNum != null
        ? cT.maxPlayListItemNum
        : rT.maxPlayListItemNum;

    if (cT.danmu != null && typeof cT.danmu == "object") {
      const rD = rT.danmu;
      const cD = cT.danmu;

      rD.speakUserName =
        cD.speakUserName != null ? cD.speakUserName : rD.speakUserName;
      rD.filterDuplicateContentDelay =
        cD.filterDuplicateContentDelay != null
          ? cD.filterDuplicateContentDelay
          : rD.filterDuplicateContentDelay;
    }
  }

  function getDefaultTextIconStyle(rSt: CSSProperties, cSt: CSSProperties) {
    rSt.color = cSt.color != null ? cSt.color : rSt.color;
    rSt.backgroundColor =
      cSt.backgroundColor != null ? cSt.backgroundColor : rSt.backgroundColor;
    rSt.borderColor =
      cSt.borderColor != null ? cSt.borderColor : rSt.borderColor;
  }

  if (config.style != null && typeof config.style == "object") {
    const rS = result.style;
    const cS = config.style;

    rS.listMargin = cS.listMargin != null ? cS.listMargin : rS.listMargin;

    if (cS.mainStyle != null && typeof cS.mainStyle == "object") {
      const rMS = rS.mainStyle;
      const cMS = cS.mainStyle;

      rMS.backgroundColor =
        cMS.backgroundColor != null ? cMS.backgroundColor : rMS.backgroundColor;
      rMS.zoom = cMS.zoom != null ? cMS.zoom : rMS.zoom;
      rMS.fontSize = cMS.fontSize != null ? cMS.fontSize : rMS.fontSize;
      rMS.fontFamily = cMS.fontFamily != null ? cMS.fontFamily : rMS.fontFamily;
      rMS.fontWeight = cMS.fontWeight != null ? cMS.fontWeight : rMS.fontWeight;
      rMS.lineHeight = cMS.lineHeight != null ? cMS.lineHeight : rMS.lineHeight;
      rMS.color = cMS.color != null ? cMS.color : rMS.color;
    }

    if (cS.giftIcon != null && typeof cS.giftIcon == "object") {
      const rGI = rS.giftIcon;
      const cGI = cS.giftIcon;

      rGI.height = cGI.height != null ? cGI.height : rGI.height;
    }

    if (cS.vipIcon != null && typeof cS.vipIcon == "object") {
      const rVI = rS.vipIcon;
      const cVI = cS.vipIcon;

      rVI.text = cVI.text != null ? cVI.text : rVI.text;

      if (cVI.style != null && typeof cVI.style == "object") {
        const rSt = rVI.style;
        const cSt = cVI.style;

        getDefaultTextIconStyle(rSt, cSt);
      }
    }

    if (cS.svipIcon != null && typeof cS.svipIcon == "object") {
      const rSI = rS.svipIcon;
      const cSI = cS.svipIcon;

      rSI.text = cSI.text != null ? cSI.text : rSI.text;

      if (cSI.style != null && typeof cSI.style == "object") {
        const rSt = rSI.style;
        const cSt = cSI.style;

        getDefaultTextIconStyle(rSt, cSt);
      }
    }

    if (cS.adminIcon != null && typeof cS.adminIcon == "object") {
      const rAI = rS.adminIcon;
      const cAI = cS.adminIcon;

      rAI.text = cAI.text != null ? cAI.text : rAI.text;

      if (cAI.style != null && typeof cAI.style == "object") {
        const rSt = rAI.style;
        const cSt = cAI.style;

        getDefaultTextIconStyle(rSt, cSt);
      }
    }

    if (cS.userName != null && typeof cS.userName == "object") {
      const rUN = rS.userName;
      const cUN = cS.userName;

      rUN.color = cUN.color != null ? cUN.color : rUN.color;
    }

    if (cS.danmuContent != null && typeof cS.danmuContent == "object") {
      const rDC = rS.danmuContent;
      const cDC = cS.danmuContent;

      rDC.color = cDC.color != null ? cDC.color : rDC.color;
    }
  }

  return result;
}
