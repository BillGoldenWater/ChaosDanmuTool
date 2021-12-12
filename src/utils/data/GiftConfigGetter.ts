import { TGiftConfigResponse } from "../../type/giftconfig/TGiftConfig";
import * as https from "https";
import { dialog } from "electron";
import { errorCode } from "../ErrorCode";

export class GiftConfigGetter {
  static giftConfigRes: TGiftConfigResponse;
  static giftConfigResStr: string;

  static init(): void {
    this.giftConfigResStr = "";
    https
      .get(
        "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc",
        {},
        (res) => {
          res.on("data", (data) => {
            this.giftConfigResStr += data.toString();
          });
          res.on("end", () => {
            this.giftConfigRes = JSON.parse(this.giftConfigResStr);
            if (this.giftConfigRes["code"] != 0) {
              this.onGiftConfigGetException(errorCode.giftConfigGetException_1);
            }
          });
        }
      )
      .on("error", (e) => {
        this.onGiftConfigGetException(
          errorCode.giftConfigGetException_2,
          e.message
        );
      });
  }

  private static onGiftConfigGetException(
    code: string,
    message?: string
  ): void {
    this.giftConfigRes = <TGiftConfigResponse>{};
    dialog.showErrorBox(
      "获取失败",
      `错误代码: ${code}\nGiftConfig 获取失败 可能导致礼物图标无法显示${
        message ? "\n" + message : ""
      }`
    );
  }
}
