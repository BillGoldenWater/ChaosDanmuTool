/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { Config } from "../type/rust/config/Config";
import type { ViewerViewConfig } from "../type/rust/config/frontendConfig/ViewerViewConfig";
import type { ReceiverStatus } from "../type/rust/command/commandPacket/appCommand/receiverStatusUpdate/ReceiverStatus";
import { AppEventTarget } from "../event/AppEventTarget";
import defaultConfig from "../type/rust/config/defaultConfig.json";
import defaultViewerConfig from "../type/rust/config/defaultViewerConfig.json";

export interface AppEnv {
  config: Config;
  customConfig: ViewerViewConfig;

  path: URL;
  setPathOption: (key: string, value: string) => void;
  receiverStatus: ReceiverStatus;

  eventTarget: AppEventTarget;
}

export const appEnv: Writable<AppEnv> = writable({
  config: defaultConfig as Config,
  customConfig: defaultViewerConfig,

  path: new URL(defaultConfig.frontend.mainView.path),
  setPathOption: null,
  receiverStatus: "close",

  eventTarget: new AppEventTarget(),
});
