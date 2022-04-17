/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { Config } from "../../../utils/config/Config";
import { MainState } from "../page/main";

export type TConfigContext = {
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, value: unknown) => void;
  updateConfig: (config: Config) => void;
  state?: MainState;
};

export const ConfigContext = React.createContext({
  get: (key: string, defaultValue?: unknown): unknown => {
    console.log(key, defaultValue);
    return undefined;
  },
  set: (key: string, value: unknown): void => {
    console.log(key, value);
  },
  updateConfig: (config: Config): void => {
    console.log(config);
  },
} as TConfigContext);
