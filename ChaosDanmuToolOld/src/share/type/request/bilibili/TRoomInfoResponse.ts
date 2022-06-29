/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TBiliBiliResponse } from "./TBiliBiliResponse";

export type TRoomInfoResponse = TBiliBiliResponse<{
  room_id: number;
  short_id: number;
  uid: number;
  need_p2p: number;
  is_hidden: boolean;
  is_locked: boolean;
  is_portrait: boolean;
  live_status: number;
  hidden_till: number;
  lock_till: number;
  encrypted: boolean;
  pwd_verified: boolean;
  live_time: number;
  room_shield: number;
  is_sp: number;
  special_type: number;
}>;
