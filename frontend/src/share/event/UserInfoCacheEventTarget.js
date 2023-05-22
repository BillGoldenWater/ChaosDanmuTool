/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

class UserInfoCacheUpdateEvent extends Event {
  userInfo;

  constructor(userInfo) {
    // noinspection JSCheckFunctionSignatures
    super(userInfo.uid);
    this.userInfo = userInfo;
  }
}

export class UserInfoCacheEventTarget extends EventTarget {
  addEventListener(uid, listener) {
    super.addEventListener(uid, listener);
  }

  removeEventListener(uid, listener) {
    super.removeEventListener(uid, listener);
  }

  dispatchUpdate(userInfo) {
    super.dispatchEvent(new UserInfoCacheUpdateEvent(userInfo));
  }
}
