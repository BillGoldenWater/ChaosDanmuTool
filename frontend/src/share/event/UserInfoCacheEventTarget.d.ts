/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserInfo } from "../type/rust/types/user_info";

declare class UserInfoCacheUpdateEvent extends Event {
  userInfo: UserInfo;

  constructor(userInfo: UserInfo);
}

declare class UserInfoCacheEventTarget extends EventTarget {
  addEventListener(
    uid: string,
    listener: (event: UserInfoCacheUpdateEvent) => void
  ): void;

  removeEventListener(
    uid: string,
    listener: (event: UserInfoCacheUpdateEvent) => void
  ): void;

  dispatchUpdate(userInfo: UserInfo): void;
}
