import https from "https";
import { TDanmuHistoryResponse } from "../../type/danmuhistory/TDanmuHistoryResponse";
import { DanmuMessage } from "../command/DanmuMessage";
import { TDanmuMsg } from "../../type/TDanmuMsg";
import { parseMedalInfo } from "../../type/TMedalInfo";
import { getUserUL } from "../../type/TUserLevel";

export class DanmuHistoryGetter {
  historyRes: TDanmuHistoryResponse;
  historyResStr: string;

  get(roomid: number, callback: (history: DanmuMessage[]) => void): void {
    this.historyResStr = "";
    https.get(
      `https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=${roomid.toString(
        10
      )}`,
      {},
      (res) => {
        res.on("data", (data) => {
          this.historyResStr += data.toString();
        });
        res.on("end", () => {
          this.historyRes = JSON.parse(this.historyResStr);

          callback(
            this.historyRes.data.room.map((value) => {
              const danmuMsg: TDanmuMsg = <TDanmuMsg>{
                fontsize: 0,
                color: 0,
                timestamp: value.check_info.ts,
                emojiData:
                  value.emoticon && value.emoticon.url ? value.emoticon : null,

                content: value.text,

                uid: value.uid,
                uName: value.nickname,
                isAdmin: value.isadmin,
                isVip: value.vip,
                isSVip: value.svip,

                medalInfo: parseMedalInfo(value.medal),

                userUL: getUserUL(value.user_level),

                userTitle:
                  value.title && value.title.length > 0 ? value.title[0] : "",
                userTitle1: "",
              };

              const msg: DanmuMessage = <DanmuMessage>{};
              msg.cmd = "DANMU_MSG";
              msg.data = danmuMsg;

              return <DanmuMessage>msg;
            })
          );
        });
      }
    );
  }
}
