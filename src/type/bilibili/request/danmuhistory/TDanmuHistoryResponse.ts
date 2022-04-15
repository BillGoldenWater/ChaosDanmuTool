/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TDanmuHistorySingle } from "./TDanmuHistorySingle";
import { TBiliBiliResponse } from "../TBiliBiliResponse";

export type TDanmuHistoryResponse = TBiliBiliResponse<{
  admin: TDanmuHistorySingle[];
  room: TDanmuHistorySingle[];
}>;
