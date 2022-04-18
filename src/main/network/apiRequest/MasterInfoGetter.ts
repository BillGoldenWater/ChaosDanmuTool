/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TMasterInfoResponse } from "../../../share/type/bilibili/request/TMasterInfoResponse";
import { getString } from "../../utils/HttpUtils";

export class MasterInfoGetter {
  static async get(uid: number): Promise<TMasterInfoResponse> {
    return JSON.parse(
      await getString(
        `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`
      )
    );
  }

  static async getFansNum(uid: number): Promise<number> {
    const res = await this.get(uid);
    if (res.code == 0) return res.data.follower_num;
    return 0;
  }
}
