import { GiftConfig } from "../command/bilibili/giftconfig/GiftConfig";
import * as https from "https";

export class GiftConfigGetter {
  static giftConfig: GiftConfig;
  static giftConfigStr: string;

  static init(): void {
    this.giftConfigStr = "";
    https.get(
      "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc",
      {},
      (res) => {
        res.on("data", (data) => {
          this.giftConfigStr += data.toString();
        });
        res.on("end", () => {
          this.giftConfig = JSON.parse(this.giftConfigStr);
        });
      }
    );
  }
}
