/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext } from "react";
import { Config } from "../type/rust/config/Config";
import { ViewerViewConfig } from "../type/rust/config/frontendConfig/ViewerViewConfig";
import { getParam } from "../utils/UrlUtils";
import defaultConfigSource from "../type/rust/config/defaultConfig.json";
import defaultViewerConfigSource from "../type/rust/config/defaultViewerConfig.json";
import { TGiftConfigMap } from "../type/TGiftConfig";
import { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import { ViewerStatus } from "../type/rust/command/commandPacket/appCommand/viewerStatusUpdate/ViewerStatus";
import { AppEventTarget } from "../event/AppEventTarget";

// region default config
export const defaultConfig: Config = defaultConfigSource as Config;
export const defaultViewerConfig: ViewerViewConfig =
  defaultViewerConfigSource as ViewerViewConfig;

// endregion

export interface TAppParams {
  pageId: "main" | "viewer";
}

function getParams(): TAppParams {
  let pageId = getParam("pageId");
  return {
    pageId: pageId != null ? (pageId == "viewer" ? pageId : "main") : "main",
  };
}

export interface TAppCtx {
  params: TAppParams;

  config: Config;
  viewerConfig: ViewerViewConfig;

  path: URL;
  giftConfig: TGiftConfigMap;
  receiverStatus: ReceiverStatus;
  viewerStatus: ViewerStatus;

  eventTarget: AppEventTarget;
}

const appCtx = createContext<TAppCtx>({
  params: { pageId: "main" },

  config: defaultConfig,
  viewerConfig: defaultViewerConfig,

  path: new URL(""),
  giftConfig: new Map(),
  receiverStatus: "close",
  viewerStatus: "close",

  eventTarget: new AppEventTarget(),
});
appCtx.displayName = "AppContext";

export const AppCtxProvider = appCtx.Provider;
export const AppCtxConsumer = appCtx.Consumer;
