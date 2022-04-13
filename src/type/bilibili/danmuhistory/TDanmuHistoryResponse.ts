/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuHistorySingle } from "./TDanmuHistorySingle";

export type TDanmuHistoryResponse = {
  code: number;
  data: {
    admin: TDanmuHistorySingle[];
    room: TDanmuHistorySingle[];
  };
  message: string;
  msg: string;
};
