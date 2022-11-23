/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import defaultConfigSource from "../type/rust/config/defaultConfig.json";
import defaultViewerConfigSource from "../type/rust/config/defaultViewerConfig.json";
import { createContext } from "react";
import { Config } from "../type/rust/config/Config";
import { ViewerViewConfig } from "../type/rust/config/frontendConfig/ViewerViewConfig";
import { getParam } from "../utils/UrlUtils";
import { TGiftConfig } from "../type/TGiftConfig";
import { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import { ViewerStatus } from "../type/rust/command/commandPacket/appCommand/viewerStatusUpdate/ViewerStatus";
import { AppEventTarget } from "../event/AppEventTarget";
import { TObjGetAndSet } from "../type/TGetAndSet";
import { AppPath, TAppPath } from "./AppPath";

// region default config
export const defaultConfig: Config = defaultConfigSource as Config;
export const defaultViewerConfig: ViewerViewConfig =
  defaultViewerConfigSource as ViewerViewConfig;

// endregion

export interface TAppParams {
  pageId: "main" | "viewer";
  viewerId: string;
}

export function getParams(): TAppParams {
  let pageId = getParam("pageId");
  let viewerId = getParam("viewerId");
  return {
    pageId: pageId != null ? (pageId == "viewer" ? pageId : "main") : "main",
    viewerId:
      viewerId != null ? viewerId : "93113675-999d-469c-a280-47ed2c5a09e4",
  };
}

export interface TAppCtx {
  params: TAppParams;
  setViewerId: (viewerId: string) => void;

  config: TObjGetAndSet<Config>;
  viewerConfig: TObjGetAndSet<ViewerViewConfig>;
  path: TAppPath;

  giftConfig: TGiftConfig;
  receiverStatus: ReceiverStatus;
  viewerStatus: ViewerStatus;

  eventTarget: AppEventTarget;
}

const appCtx = createContext<TAppCtx>({
  params: getParams(),
  setViewerId: () => undefined,

  config: {} as TObjGetAndSet<Config>,
  viewerConfig: {} as TObjGetAndSet<ViewerViewConfig>,
  path: new AppPath(defaultConfig),

  giftConfig: new Map(),
  receiverStatus: "close",
  viewerStatus: "close",

  eventTarget: new AppEventTarget(),
});
appCtx.displayName = "AppContext";

export const AppCtxProvider = appCtx.Provider;
export const AppCtxConsumer = appCtx.Consumer;
