import { MessageCommand } from "../command/MessageCommand";
import https from "https";
import { TDanmuHistoryResponse } from "../../type/danmuhistory/TDanmuHistoryResponse";

export class DanmuHistoryGetter {
  historyRes: TDanmuHistoryResponse;
  historyResStr: string;

  get(roomid: number, callback: (history: MessageCommand[]) => void): void {
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
          // callback();
        });
      }
    );
  }
}
