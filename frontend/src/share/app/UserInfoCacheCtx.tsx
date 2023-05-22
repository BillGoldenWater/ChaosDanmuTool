/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserInfo } from "../type/rust/types/user_info";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultUserInfo } from "./Defaults";
import { useAppCtx } from "./AppCtx";
import {
  MaxUserInfoCacheSize,
  UserInfoCacheRemainingPercent,
} from "./Settings";
import { TUserInfoCache } from "../type/TUserInfoCache";
import { UserInfoUpdateEvent } from "../event/AppEventTarget";
import { backend } from "./BackendApi";
import {
  UserInfoCacheEventTarget,
  UserInfoCacheUpdateEvent,
} from "../event/UserInfoCacheEventTarget";

export type UserInfoGetter = (uid: string) => UserInfo;

interface TUserInfoCacheCtx {
  getUserInfo: UserInfoGetter;
  eventTarget: UserInfoCacheEventTarget;
}

const UserInfoCacheCtx = createContext<TUserInfoCacheCtx>({
  getUserInfo: (uid) => ({
    ...defaultUserInfo,
    uid,
  }),
  eventTarget: new UserInfoCacheEventTarget(),
});

export function UserInfoCacheProvider({ children }: PropsWithChildren) {
  const ctx = useAppCtx();

  const [eventTarget] = useState(() => new UserInfoCacheEventTarget());

  const [initialUserInfoCache] = useState(() => new Map());
  const userInfoCache = useRef<TUserInfoCache>(initialUserInfoCache);

  const updateUserInfo = useCallback(
    (userInfo: UserInfo) => {
      const cache = userInfoCache.current;
      cache.set(userInfo.uid, { lastUse: Date.now(), userInfo });
      eventTarget.dispatchUpdate(userInfo);

      if (cache.size > MaxUserInfoCacheSize) {
        const remainingSize = Math.floor(
          MaxUserInfoCacheSize * UserInfoCacheRemainingPercent
        );

        return Array.from(cache.entries())
          .map((it) => it[1])
          .sort((a, b) => a.lastUse - b.lastUse)
          .slice(cache.size - remainingSize, cache.size)
          .forEach((it) => cache.delete(it.userInfo.uid));
      }
    },
    [eventTarget]
  );

  useEffect(() => {
    function onUserInfoUpdate(event: UserInfoUpdateEvent) {
      updateUserInfo(event.userInfo);
    }

    ctx.eventTarget.addEventListener("userInfoUpdate", onUserInfoUpdate);

    return () =>
      ctx.eventTarget.removeEventListener("userInfoUpdate", onUserInfoUpdate);
  }, [ctx.eventTarget, updateUserInfo]);

  const userInfoPending = useRef<Set<string>>(new Set());
  const getUserInfo = useCallback<UserInfoGetter>(
    (uid) => {
      const cache = userInfoCache.current;
      const pending = userInfoPending.current;

      const result = cache.get(uid);
      if (result == null) {
        if (!pending.has(uid)) {
          backend.getUserInfo(uid).then((userInfo) => {
            updateUserInfo(userInfo);
            pending.delete(uid);
          });

          pending.add(uid);
        }
        return { ...defaultUserInfo, uid };
      }
      result.lastUse = Date.now();
      return result.userInfo;
    },
    [updateUserInfo]
  );

  const userInfoCacheCtx = useMemo<TUserInfoCacheCtx>(
    () => ({
      getUserInfo,
      eventTarget,
    }),
    [eventTarget, getUserInfo]
  );

  return (
    <UserInfoCacheCtx.Provider value={userInfoCacheCtx}>
      {children}
    </UserInfoCacheCtx.Provider>
  );
}

export function useUserInfo(uid: string) {
  const { getUserInfo, eventTarget } = useContext(UserInfoCacheCtx);
  const [userInfo, setUserInfo] = useState(() => getUserInfo(uid));

  useEffect(() => {
    function onUpdate(userInfoUpdateEvent: UserInfoCacheUpdateEvent) {
      setUserInfo(userInfoUpdateEvent.userInfo);
    }

    eventTarget.addEventListener(uid, onUpdate);

    return () => {
      eventTarget.removeEventListener(uid, onUpdate);
    };
  });

  return userInfo;
}
