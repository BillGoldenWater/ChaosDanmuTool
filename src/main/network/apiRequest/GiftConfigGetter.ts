/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TGiftConfigResponse } from "../../type/request/bilibili/giftconfig/TGiftConfig";
import { getString } from "../../utils/HttpUtils";

export class GiftConfigGetter {
  static async get(): Promise<TGiftConfigResponse> {
    const url =
      "https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc";
    return JSON.parse(await getString(url));
  }
}
