/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UserInfo } from "./rust/types/user_info";

export interface UserInfoCacheItem {
  lastUse: number;
  userInfo: UserInfo;
}

export type TUserInfoCache = Map<string, UserInfoCacheItem>;
