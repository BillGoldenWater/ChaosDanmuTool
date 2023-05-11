/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Config } from "../type/rust/config";
import { ViewerViewConfig } from "../type/rust/config/frontend_config/viewer_view_config";
import { getParam } from "../utils/UrlUtils";
import { TGiftConfigState } from "../type/TGiftConfig";
import {
  AppEventMap,
  AppEventTarget,
  ConfigUpdateEvent,
  GiftConfigUpdateEvent,
  ReceiverStatusUpdateEvent,
  UserInfoUpdateEvent,
  ViewerStatusUpdateEvent,
} from "../event/AppEventTarget";
import { TObjGet, TObjGetAndSet, TObjSet } from "../type/TGetAndSet";
import { AppPath, TAppPath } from "./AppPath";
import { TWindow } from "../../window/Window";
import { TUserInfoCache } from "../type/TUserInfoCache";
import { CommandReceiver } from "./CommandReceiver";
import { backend } from "./BackendApi";
import { getProp, setProp } from "../utils/DotPropUtils";
import Immutable from "immutable";
import {
  MaxUserInfoCacheSize,
  UserInfoCacheRemainingPercent,
} from "./Settings";
import {
  defaultConfig,
  defaultUserInfo,
  defaultViewerConfig,
} from "./Defaults";
import { ReceiverStatus } from "../type/rust/command_packet/app_command/receiver_status_update";
import { ViewerStatus } from "../type/rust/command_packet/app_command/viewer_status_update";
import { UserInfo } from "../type/rust/types/user_info";

export interface TAppParams {
  windowId: TWindow["windowId"];
  viewerId: string;
}

export function getParams(): TAppParams {
  const pageId = getParam("windowId");
  const viewerId = getParam("viewerId");
  return {
    windowId: pageId != null ? (pageId == "viewer" ? pageId : "main") : "main",
    viewerId:
      viewerId != null ? viewerId : "93113675-999d-469c-a280-47ed2c5a09e4",
  };
}

export type UserInfoGetter = (uid: string) => UserInfo;

export interface TAppCtx {
  params: TAppParams;
  setViewerId: (viewerId: string) => void;

  config: TObjGetAndSet<Config>;
  viewerConfig: TObjGetAndSet<ViewerViewConfig>;
  getUserInfo: UserInfoGetter;
  path: TAppPath;

  giftConfig: TGiftConfigState;
  receiverStatus: ReceiverStatus;
  viewerStatus: ViewerStatus;

  eventTarget: AppEventTarget;
}

export const appCtx = createContext<TAppCtx>({
  params: getParams(),
  setViewerId: () => undefined,

  config: {} as TObjGetAndSet<Config>,
  viewerConfig: {} as TObjGetAndSet<ViewerViewConfig>,
  getUserInfo: (uid) => ({
    ...defaultUserInfo,
    uid,
  }),
  path: new AppPath(defaultConfig),

  giftConfig: Immutable.Map(),
  receiverStatus: "close",
  viewerStatus: "close",

  eventTarget: new AppEventTarget(),
});
appCtx.displayName = "AppContext";

const AppCtxProv = appCtx.Provider;

interface Props extends PropsWithChildren {
  firstConfig: Config;
}

interface TAppConstant {
  eventTarget: AppEventTarget;
  receiver: CommandReceiver;
}

export function AppCtxProvider({ firstConfig, children }: Props) {
  // region state
  const [params, setParams] = useState<TAppParams>(() => getParams());
  const [appConstant] = useState<TAppConstant>(() =>
    initialAppConstant(firstConfig, params)
  );

  const [config, setConfig] = useState<Config>(firstConfig);

  const [giftConfig, setGiftConfig] = useState<TGiftConfigState>(Immutable.Map);
  const [receiverStatus, setReceiverStatus] = useState<ReceiverStatus>("close");
  const [viewerStatus, setViewerStatus] = useState<ViewerStatus>("close");
  const [userInfoCache, setUserInfoCache] = useState<TUserInfoCache>(
    Immutable.Map
  );
  // endregion

  // region event
  // region utils
  const addListener = useCallback(
    <K extends keyof AppEventMap, F extends (event: AppEventMap[K]) => void>(
      type: K,
      listener: F
    ) => {
      appConstant.eventTarget.addEventListener(type, listener);
    },
    [appConstant.eventTarget]
  );

  const removeListener = useCallback(
    <K extends keyof AppEventMap, F extends (event: AppEventMap[K]) => void>(
      type: K,
      listener: F
    ) => {
      appConstant.eventTarget.removeEventListener(type, listener);
    },
    [appConstant.eventTarget]
  );

  const updateUserInfo = useCallback((userInfo: UserInfo) => {
    setUserInfoCache((prev) => {
      const cache = prev.set(userInfo.uid, {
        lastUse: Date.now(),
        userInfo,
      });

      if (cache.size > MaxUserInfoCacheSize) {
        const remainingSize = Math.floor(
          MaxUserInfoCacheSize * UserInfoCacheRemainingPercent
        );

        return cache
          .sortBy((it) => it.lastUse)
          .slice(cache.size - remainingSize, cache.size);
      }

      return cache;
    });
  }, []);
  // endregion

  useEffect(() => {
    function onConfigUpdate(event: ConfigUpdateEvent) {
      setConfig(event.config);
    }

    addListener("configUpdate", onConfigUpdate);

    return () => removeListener("configUpdate", onConfigUpdate);
  }, [addListener, removeListener]);
  useEffect(() => {
    function onGiftConfigUpdate(event: GiftConfigUpdateEvent) {
      setGiftConfig(Immutable.Map(event.giftConfig));
    }

    addListener("giftConfigUpdate", onGiftConfigUpdate);

    return () => removeListener("giftConfigUpdate", onGiftConfigUpdate);
  }, [addListener, removeListener]);
  useEffect(() => {
    function onReceiverStatusUpdate(event: ReceiverStatusUpdateEvent) {
      setReceiverStatus(event.status);
    }

    addListener("receiverStatusUpdate", onReceiverStatusUpdate);

    return () => removeListener("receiverStatusUpdate", onReceiverStatusUpdate);
  }, [addListener, removeListener]);
  useEffect(() => {
    function onUserInfoUpdate(event: UserInfoUpdateEvent) {
      updateUserInfo(event.userInfo);
    }

    addListener("userInfoUpdate", onUserInfoUpdate);

    return () => removeListener("userInfoUpdate", onUserInfoUpdate);
  }, [addListener, updateUserInfo, removeListener]);
  useEffect(() => {
    function onViewerStatusUpdate(event: ViewerStatusUpdateEvent) {
      setViewerStatus(event.status);
    }

    addListener("viewerStatusUpdate", onViewerStatusUpdate);

    return () => removeListener("viewerStatusUpdate", onViewerStatusUpdate);
  }, [addListener, removeListener]);
  // endregion

  useEffect(() => {
    appConstant.receiver.open();
    return () => appConstant.receiver.close();
  }, [appConstant.receiver]);

  // region ctx
  const setViewerId = useCallback(
    (newViewerId: string) => {
      setParams({ ...params, viewerId: newViewerId });
    },
    [params]
  );

  // region config
  const updateConfig = useCallback((config: Config) => {
    setConfig(config);
    backend.updateConfig(config).then();
  }, []);

  const configGet: TObjGet<Config> = useCallback(
    (key, defaultValue) => getProp(config, key, defaultValue),
    [config]
  );

  const configSet: TObjSet<Config> = useCallback(
    (key, value) => {
      setProp(config, key, value);
      updateConfig(config);
    },
    [config, updateConfig]
  );
  // endregion

  // region viewerConfig
  const getViewerConfig = useCallback(() => {
    const viewerViews = config.frontend.viewerView;

    let result = viewerViews.find((it) => it.uuid === params.viewerId);
    if (result == null) {
      result = viewerViews.find(
        (it) => it.uuid === defaultConfig.frontend.viewerView[0].uuid
      );
      console.error("fallback to default internal viewerConfig");
    }
    if (result == null) {
      console.error("fallback to defaultViewerConfig");
      result = defaultViewerConfig;
    }
    return result as ViewerViewConfig;
  }, [config.frontend.viewerView, params.viewerId]);

  const viewerConfigGet: TObjGet<ViewerViewConfig> = useCallback(
    (key, defaultValue) => {
      return getProp(getViewerConfig(), key, defaultValue);
    },
    [getViewerConfig]
  );

  const viewerConfigSet: TObjSet<ViewerViewConfig> = useCallback(
    (key, value) => {
      setProp(getViewerConfig(), key, value);
      updateConfig(config);
    },
    [config, getViewerConfig, updateConfig]
  );
  // endregion

  // region userInfo
  const userInfoPending = useRef<Set<string>>(new Set());
  const getUserInfo = useCallback<UserInfoGetter>(
    (uid) => {
      const result = userInfoCache.get(uid);
      if (result == undefined) {
        if (!userInfoPending.current.has(uid)) {
          backend.getUserInfo(uid).then((userInfo) => {
            updateUserInfo(userInfo);
            userInfoPending.current.delete(uid);
          });

          userInfoPending.current.add(uid);
        }
        return { ...defaultUserInfo, uid };
      }
      result.lastUse = Date.now();
      return result.userInfo;
    },
    [updateUserInfo, userInfoCache]
  );
  // endregion

  // region path
  const getPath = useCallback(() => new AppPath(config), [config]);

  const pathGet = useCallback(
    <T,>(key: string, defaultValue?: T): T | undefined =>
      getPath().get(key, defaultValue),
    [getPath]
  );
  const pathSet = useCallback(
    <T,>(key: string, value: T) => {
      const path = getPath();
      path.set(key, value);

      configSet("frontend.mainView.path", path.toString());
    },
    [configSet, getPath]
  );
  // endregion

  const ctx: TAppCtx = {
    params,
    setViewerId,

    config: { get: configGet, set: configSet },
    viewerConfig: { get: viewerConfigGet, set: viewerConfigSet },
    getUserInfo,
    path: { get: pathGet, set: pathSet },

    giftConfig,
    receiverStatus,
    viewerStatus,

    eventTarget: appConstant.eventTarget,
  };
  // endregion

  return <AppCtxProv value={ctx}>{children}</AppCtxProv>;
}

export function initialAppConstant(
  firstConfig: Config,
  params: TAppParams
): TAppConstant {
  const eventTarget = new AppEventTarget();
  const receiver = new CommandReceiver({
    eventTarget,
    location: "AppContext",
    port: firstConfig.backend.httpServer.port,
  });

  // in viewer or open in browser
  if (params.windowId === "viewer" || !backend.isInTauri) {
    receiver.updateOption({ host: window.location.hostname });
  }

  return {
    eventTarget,
    receiver,
  };
}
