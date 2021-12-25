import { CSSProperties } from "react";
import { cloneDeep, defaultsDeep } from "lodash-es";

export type UpdateConfig = {
  ignoreVersion: string;
};

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

export type TextReplacerConfig = {
  searchValue: string;
  replaceValue: string;
  isRegExp: boolean;
};

export type BlackListMatchConfig = {
  searchValue: string;
  isRegExp: boolean;
};

export type DanmuToSpeechConfig = {
  speakUserName: boolean;
  filterDuplicateContentDelay: number;
};

export type TextToSpeechConfig = {
  enable: boolean;
  maxPlayListItemNum: number;
  rate: number | string;
  pitch: number | string;
  volume: number | string;
  textReplacer: TextReplacerConfig[];
  blackListMatch: BlackListMatchConfig[];

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
  update: UpdateConfig;
  danmuReceiver: DanmuReceiverConfig;
  danmuViewConfig: DanmuViewConfig;
  danmuViewCustoms: DanmuViewCustomConfig[];
};

const defaultTextReplacer: TextReplacerConfig = {
  searchValue: "",
  replaceValue: "",
  isRegExp: false,
};

const defaultBlackListMatch: BlackListMatchConfig = {
  searchValue: "",
  isRegExp: false,
};

const defaultDanmuViewCustom: DanmuViewCustomConfig = {
  name: "default",
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
    rate: "1+(text.length/40)",
    pitch: 1,
    volume: 1,
    textReplacer: [
      { searchValue: "233+", replaceValue: "二三三", isRegExp: true },
      { searchValue: "666+", replaceValue: "六六六", isRegExp: true },
      { searchValue: "77", replaceValue: "七七", isRegExp: true },
    ],
    blackListMatch: [
      { searchValue: ".*(:|：|冒号).*(\\.|点|·|丶|_).*", isRegExp: true },
    ],
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
      fontSize: "3.5vw",
      fontFamily: "",
      fontWeight: 400,
      lineHeight: "1.8em",
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
  update: {
    ignoreVersion: "",
  },
  danmuReceiver: {
    serverUrl: "wss://broadcastlv.chat.bilibili.com/sub",
    roomid: 0,
    heartBeatInterval: 30,
  },
  danmuViewConfig: {
    autoOpenWhenConnect: true,
    maxReconnectAttemptNumber: -1,
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

function getTag(obj: unknown): string {
  return Object.prototype.toString.call(obj);
}

const arrayTag = getTag([]);

export function getDefaultConfig(config?: Config): Config {
  if (!config) return cloneDeep(defaultConfig);

  const result: Config = cloneDeep(config);
  defaultsDeep(result, defaultConfig);

  if (
    config.danmuViewCustoms != null && // 不为空
    getTag(config.danmuViewCustoms) == arrayTag && // 是数组
    config.danmuViewCustoms.length > 0 // 有东西
  ) {
    result.danmuViewCustoms = config.danmuViewCustoms.map((value) => {
      return getDefaultDanmuViewCustomConfig(value);
    });
  }

  return result;
}

export function getDefaultDanmuViewCustomConfig(
  config?: DanmuViewCustomConfig
): DanmuViewCustomConfig {
  if (!config) return cloneDeep(defaultDanmuViewCustom);

  const result: DanmuViewCustomConfig = cloneDeep(config);
  defaultsDeep(result, defaultDanmuViewCustom);

  if (config.tts != null) {
    const cTts = config.tts;

    if (cTts.textReplacer != null && getTag(cTts.textReplacer) == arrayTag) {
      result.tts.textReplacer = cTts.textReplacer.map((value) => {
        return defaultsDeep(cloneDeep(value), defaultTextReplacer);
      });
    }

    if (
      cTts.blackListMatch != null &&
      getTag(cTts.blackListMatch) == arrayTag
    ) {
      result.tts.blackListMatch = cTts.blackListMatch.map((value) => {
        return defaultsDeep(cloneDeep(value), defaultBlackListMatch);
      });
    }
  }

  return result;
}

export function getDefaultTextReplacerConfig(
  config?: TextReplacerConfig
): TextReplacerConfig {
  if (!config) return cloneDeep(defaultTextReplacer);

  const result: TextReplacerConfig = cloneDeep(config);
  defaultsDeep(result, defaultTextReplacer);

  return result;
}

export function getDefaultBlackListMatchConfig(
  config?: BlackListMatchConfig
): BlackListMatchConfig {
  if (!config) return cloneDeep(defaultBlackListMatch);

  const result: BlackListMatchConfig = cloneDeep(config);
  defaultsDeep(result, defaultBlackListMatch);

  return result;
}
