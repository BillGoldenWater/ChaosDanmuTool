/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UserInfo } from "./rust/cache/userInfo/UserInfo";
import Immutable from "immutable";

export interface UserInfoCacheItem {
  lastUse: number;
  userInfo: UserInfo;
}

export type TUserInfoCache = Immutable.Map<string, UserInfoCacheItem>;