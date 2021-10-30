import { GiftConfigResponse } from "../../model/giftconfig/GiftConfig";
import * as https from "https";

export class GiftConfigGetter {
  static giftConfigRes: GiftConfigResponse;
  static giftConfigResStr: string;

  static init(): void {
    this.giftConfigResStr = "";
    https.get(
      "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc",
      {},
      (res) => {
        res.on("data", (data) => {
          this.giftConfigResStr += data.toString();
        });
        res.on("end", () => {
          this.giftConfigRes = JSON.parse(this.giftConfigResStr);
        });
      }
    );
  }
}
