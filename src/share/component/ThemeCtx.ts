/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext } from "react";
import { defaultConfig } from "../app/AppCtx";
import { Config } from "../type/rust/config/Config";

type ThemeConfig = Config["frontend"]["mainView"]["theme"];

export interface TColors {
  backgroundColor: string;
}

export interface TThemeCtx {
  theme: ThemeConfig;

  colors: TColors; // todo
}

export function genColors(theme: ThemeConfig): TColors {
  return {
    backgroundColor: "",
  };
}

export function isDark(): boolean | undefined {
  return window.matchMedia("(prefers-color-scheme: dark)")?.matches;
}

const themeCtx = createContext<TThemeCtx>({
  theme: defaultConfig.frontend.mainView.theme,

  colors: genColors(defaultConfig.frontend.mainView.theme),
});

export const ThemeCtxProvider = themeCtx.Provider;
export const ThemeCtxConsumer = themeCtx.Consumer;
