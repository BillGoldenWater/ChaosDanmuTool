/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuMsg } from "../../../type/bilibili/TDanmuMsg";
import {
  getDefaultDanmuViewCustomConfig,
  TextToSpeechConfig,
} from "../../../utils/config/Config";

export type DanmuItem = {
  ts: number;
  uName: string;
  content: string;
};

export class TextToSpeech {
  config: TextToSpeechConfig;

  playListNum: number;
  danmuHistory: DanmuItem[];

  constructor() {
    this.updateConfig(getDefaultDanmuViewCustomConfig().tts);
  }

  updateConfig(config: TextToSpeechConfig): void {
    this.config = config;
    this.reset();
  }

  reset(): void {
    this.playListNum = 0;
    this.danmuHistory = [];
    speechSynthesis.cancel();
  }

  speak(text: string): void {
    if (!this.config.enable) return;
    if (this.playListNum >= this.config.maxPlayListItemNum) return;

    //region 文本替换
    this.config.textReplacer.forEach((value) => {
      if (value.isRegExp) {
        text = text.replaceAll(
          RegExp(value.searchValue, "g"),
          value.replaceValue
        );
      } else {
        text = text.replaceAll(value.searchValue, value.replaceValue);
      }
    });
    //endregion

    //region 黑名单匹配
    const matchResult = this.config.blackListMatch.map((value) => {
      if (value.isRegExp) {
        return text.match(RegExp(value.searchValue, "g")) !== null;
      } else {
        return text.includes(value.searchValue);
      }
    });

    if (matchResult.includes(true)) return;
    //endregion

    const ssu = new SpeechSynthesisUtterance(text);

    ssu.rate = eval(this.config.rate.toString());
    ssu.pitch = eval(this.config.pitch.toString());
    ssu.volume = eval(this.config.volume.toString());

    ssu.onend = () => {
      this.playListNum--;
    };

    speechSynthesis.speak(ssu);
    this.playListNum++;
  }

  speakDanmu(danmuMsg: TDanmuMsg): void {
    const config = this.config.danmu;

    const di: DanmuItem = {
      ts: new Date().getTime(),
      uName: danmuMsg.uName,
      content: danmuMsg.content,
    };

    this.danmuHistory = this.danmuHistory.filter((value) => {
      return (
        value.ts + this.config.danmu.filterDuplicateContentDelay * 1000 >=
        new Date().getTime()
      );
    });

    const duplicateContentIndex = this.danmuHistory.findIndex((value) => {
      return value.content == di.content;
    });

    if (duplicateContentIndex != -1) {
      this.danmuHistory[duplicateContentIndex].ts = new Date().getTime();
      return;
    }

    this.danmuHistory.push(di);
    this.speak((config.speakUserName ? `${di.uName} 说: ` : "") + di.content);
  }
}
