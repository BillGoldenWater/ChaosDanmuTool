/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliResponse } from "../TBiliBiliResponse";
import { TDanmuSeverHostInfo } from "./TDanmuSeverHostInfo";

export type TDanmuServerInfoResponse = TBiliBiliResponse<{
  group: string;
  business_id: number;
  refresh_row_factor: number;
  refresh_rate: number;
  max_delay: number;
  token: string;
  host_list: TDanmuSeverHostInfo[];
}>;
