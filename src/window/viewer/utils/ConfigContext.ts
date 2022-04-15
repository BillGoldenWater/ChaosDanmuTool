/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import {
  DanmuViewCustomConfig,
  getDefaultDanmuViewCustomConfig,
} from "../../../utils/config/Config";
import { MainState } from "../page/main";
import { TGiftConfig } from "../../../type/bilibili/request/giftconfig/TGiftConfig";

export type TConfigContext = {
  config: DanmuViewCustomConfig;
  giftConfig: TGiftConfig;
  state?: MainState;
};

export const ConfigContext = React.createContext({
  config: getDefaultDanmuViewCustomConfig(),
  giftConfig: undefined,
} as TConfigContext);
