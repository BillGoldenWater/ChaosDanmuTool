import { TDanmuMsg } from "../../../type/TDanmuMsg";
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

    const ssu = new SpeechSynthesisUtterance(text);
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
