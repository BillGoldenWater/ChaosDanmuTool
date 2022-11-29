/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext } from "react";
import { defaultConfig } from "../app/AppCtx";
import { Config } from "../type/rust/config/Config";
import Color from "color";
import { TPropToString } from "../type/TPropToString";

type ThemeConfig = Config["frontend"]["mainView"]["theme"];

export interface TColorPlate {
  background: Color;

  text: Color;
  titleText: Color;
  secondaryText: Color;

  up: Color;
  upDouble: Color;
  down: Color;
  downDouble: Color;

  themeUp: Color;
  themeUpDouble: Color;
  themeDown: Color;

  themePrimary: Color;
  themePrimaryUp: Color;
  themePrimaryDown: Color;

  themeSolid: Color;
  themeText: Color;

  [key: string]: Color;
}

export type TColors = TPropToString<TColorPlate>;

export interface TThemeCtx {
  theme: ThemeConfig;

  colors: [TColorPlate, TColors];
}

function colorPlateToColors(colorPlate: TColorPlate): TColors {
  const result: TColors = {} as TColors;
  for (const key in colorPlate) {
    result[key] = colorPlate[key].hsl().string();
  }
  return result;
}

export function genColors(theme: ThemeConfig): [TColorPlate, TColors] {
  const themeColor = Color(theme.themeColor);

  function getDown(percent: number) {
    return Color([0, 0, 0, percent], "hsl");
  }

  function getUp(percent: number) {
    return Color([0, 0, 100, percent], "hsl");
  }

  function getTheme(percent: number) {
    return Color(
      [
        themeColor.hue(),
        themeColor.saturationl(),
        themeColor.lightness(),
        percent,
      ],
      "hsl"
    );
  }

  let colorPlate: TColorPlate;
  if (theme.themeId === "dark") {
    // todo
    colorPlate = {
      background: getTheme(1.0).desaturate(0.95).darken(0.8).alpha(0.8),

      text: getTheme(1.0).desaturate(0.95).lighten(0.9).alpha(0.95),
      titleText: getTheme(1.0).desaturate(0.95).lighten(0.9).alpha(1),
      secondaryText: getTheme(1.0).desaturate(0.95).lighten(0.9).alpha(0.6),

      up: Color(),
      upDouble: Color(),
      down: Color(),
      downDouble: Color(),

      themeUp: Color(),
      themeUpDouble: Color(),
      themeDown: Color(),

      themePrimary: Color(),
      themePrimaryUp: Color(),
      themePrimaryDown: Color(),

      themeSolid: Color(),
      themeText: Color(),
    };
  } else {
    colorPlate = {
      background: getTheme(1.0).desaturate(0.9).lighten(0.7).alpha(0.9),

      text: Color(),
      titleText: Color(),
      secondaryText: Color(),

      up: Color(),
      upDouble: Color(),
      down: Color(),
      downDouble: Color(),

      themeUp: Color(),
      themeUpDouble: Color(),
      themeDown: Color(),

      themePrimary: Color(),
      themePrimaryUp: Color(),
      themePrimaryDown: Color(),

      themeSolid: Color(),
      themeText: Color(),
    };
  }

  return [colorPlate, colorPlateToColors(colorPlate)];
}

export function isDark(): boolean | undefined {
  return window.matchMedia("(prefers-color-scheme: dark)")?.matches;
}

const themeCtx = createContext<TThemeCtx>({
  theme: defaultConfig.frontend.mainView.theme,

  colors: genColors(defaultConfig.frontend.mainView.theme),
});
themeCtx.displayName = "ThemeContext";

export const ThemeCtxProvider = themeCtx.Provider;
export const ThemeCtxConsumer = themeCtx.Consumer;
