/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CSSProperties } from "react";
import { cloneDeep, defaultsDeep } from "lodash-es";
import { arrayTag, getArrayDiff, getDiff, getTag } from "../ObjectUtils";
import { v4 as uuidv4 } from "uuid";

export type HistoryConfig = {
  autoCutAt: number;
};

export type UpdateConfig = {
  ignoreVersion: string;
};

export type DanmuReceiverConfig = {
  serverUrl: string;
  roomid: number;
  heartBeatInterval: number;
  autoReconnect: boolean;
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
  formatWatched: boolean;
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
  uuid: string;
  searchValue: string;
  replaceValue: string;
  isRegExp: boolean;
};

export type BlackListMatchConfig = {
  uuid: string;
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
  uuid: string;
  maxDanmuNumber: number;
  danmuMergeMinNum: number;
  statusBarDisplay: boolean;
  statusMessageDisplay: boolean;
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
  history: HistoryConfig;
  update: UpdateConfig;
  danmuReceiver: DanmuReceiverConfig;
  danmuViewConfig: DanmuViewConfig;
  danmuViewCustoms: DanmuViewCustomConfig[];
};

const defaultTextReplacer: TextReplacerConfig = {
  uuid: "00000000-0000-0000-0000-000000000000",
  searchValue: "",
  replaceValue: "",
  isRegExp: false,
};

const defaultBlackListMatch: BlackListMatchConfig = {
  uuid: "00000000-0000-0000-0000-000000000000",
  searchValue: "",
  isRegExp: false,
};

const defaultDanmuViewCustom: DanmuViewCustomConfig = {
  name: "default",
  uuid: "00000000-0000-0000-0000-000000000000",
  maxDanmuNumber: 100,
  danmuMergeMinNum: 10,
  statusBarDisplay: true,
  statusMessageDisplay: true,
  superChatAlwaysOnTop: true,
  numberFormat: {
    formatActivity: true,
    formatFansNum: true,
    formatWatched: true,
  },
  tts: {
    enable: false,
    maxPlayListItemNum: 2,
    rate: "1+(text.length/40)",
    pitch: 1,
    volume: 1,
    textReplacer: [
      {
        uuid: "0f0b6682-d6c0-47aa-8db3-1944d5e6a3cd",
        searchValue: "233+",
        replaceValue: "二三三",
        isRegExp: true,
      },
      {
        uuid: "658252d0-321c-45a2-b610-0d878d3cd0a0",
        searchValue: "666+",
        replaceValue: "六六六",
        isRegExp: true,
      },
      {
        uuid: "361687e3-a232-42fc-b0e0-cadd6a4d5600",
        searchValue: "77",
        replaceValue: "七七",
        isRegExp: true,
      },
    ],
    blackListMatch: [
      {
        uuid: "72efd7d7-3430-47a9-8470-f7259a45ad9d",
        searchValue: ".*(:|：|冒号).*(\\.|点|·|丶|_).*",
        isRegExp: true,
      },
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

export const defaultViewCustomInternalUUID =
  "93113675-999d-469c-a280-47ed2c5a09e4";
export const defaultViewCustomOtherUUID =
  "8ec89836-5ba4-43e6-805c-7fc8f96eaf1f";

const defaultConfig: Config = {
  forChaosDanmuTool: true,
  autoSaveOnQuit: true,
  autoSaveOnChange: true,
  httpServerPort: 25555,
  darkTheme: true,
  history: {
    autoCutAt: 15,
  },
  update: {
    ignoreVersion: "",
  },
  danmuReceiver: {
    serverUrl: "wss://broadcastlv.chat.bilibili.com/sub",
    roomid: 0,
    heartBeatInterval: 30,
    autoReconnect: false,
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
      name: "内置弹幕查看器",
      uuid: defaultViewCustomInternalUUID,
    },
    {
      ...defaultDanmuViewCustom,
      name: "其他",
      uuid: defaultViewCustomOtherUUID,
    },
  ],
};

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
  if (!config)
    return ((config: DanmuViewCustomConfig) => {
      config.uuid = uuidv4();
      return config;
    })(cloneDeep(defaultDanmuViewCustom));

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

  if (!result.uuid || result.uuid === "00000000-0000-0000-0000-000000000000") {
    result.uuid = uuidv4();
    if (result.name === defaultConfig.danmuViewCustoms[0].name) {
      result.uuid = defaultViewCustomInternalUUID;
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

  if (config.uuid === "00000000-0000-0000-0000-000000000000")
    config.uuid = uuidv4();

  return result;
}

export function getDefaultBlackListMatchConfig(
  config?: BlackListMatchConfig
): BlackListMatchConfig {
  if (!config) return cloneDeep(defaultBlackListMatch);

  const result: BlackListMatchConfig = cloneDeep(config);
  defaultsDeep(result, defaultBlackListMatch);

  if (config.uuid === "00000000-0000-0000-0000-000000000000")
    config.uuid = uuidv4();

  return result;
}

export function getDiffConfig(config: Config): Config {
  return ((diff: Config) => {
    if (!diff) {
      diff = {} as Config;
    }
    diff.forChaosDanmuTool = true;

    diff.danmuViewCustoms = getArrayDiff(
      config.danmuViewCustoms,
      defaultDanmuViewCustom,
      defaultConfig.danmuViewCustoms,
      (diff, origin) => {
        let obj: DanmuViewCustomConfig = diff;

        const diffTextReplacer = getArrayDiff(
          origin.tts.textReplacer,
          defaultTextReplacer,
          defaultDanmuViewCustom.tts.textReplacer
        );
        const diffBlackListMatch = getArrayDiff(
          origin.tts.blackListMatch,
          defaultBlackListMatch,
          defaultDanmuViewCustom.tts.blackListMatch
        );

        if (diffTextReplacer || diffBlackListMatch) {
          if (!obj) obj = {} as DanmuViewCustomConfig;
          if (!obj.tts) obj.tts = {} as TextToSpeechConfig;

          obj.tts.textReplacer = diffTextReplacer;
          obj.tts.blackListMatch = diffBlackListMatch;
        }

        return obj;
      }
    );

    return diff;
  })(getDiff(config, defaultConfig));
}
