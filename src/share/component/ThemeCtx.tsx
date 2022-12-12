/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { appCtx, defaultConfig } from "../app/AppCtx";
import { Config } from "../type/rust/config/Config";
import Color from "color";
import { TPropToString } from "../type/TPropToString";
import { backend } from "../app/BackendApi";

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
  toggleTheme: (dark?: boolean) => void;
}

function colorPlateToColors(colorPlate: TColorPlate): TColors {
  const result: TColors = {} as TColors;
  for (const key in colorPlate) {
    result[key] = colorPlate[key].hsl().string();
  }
  return result;
}

export async function genColors(
  theme: ThemeConfig
): Promise<[TColorPlate, TColors]> {
  const vibrancyApplied = (await backend?.isVibrancyApplied()) || false;
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
    // todo finish colorPlate
    colorPlate = {
      background: getTheme(1.0).desaturate(0.95).darken(0.8).fade(0.2),

      text: getTheme(1.0).desaturate(0.95).lighten(0.9).fade(0.05),
      titleText: getTheme(1.0).desaturate(0.95).lighten(0.9).fade(0),
      secondaryText: getTheme(1.0).desaturate(0.95).lighten(0.9).fade(0.4),

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
    if (!vibrancyApplied) {
      colorPlate.background = colorPlate.background.alpha(1);
    }
  } else {
    colorPlate = {
      background: getTheme(1.0).desaturate(0.9).lighten(0.7).fade(0.1),

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
    if (!vibrancyApplied) {
      colorPlate.background = colorPlate.background.alpha(1);
    }
  }

  return [colorPlate, colorPlateToColors(colorPlate)];
}

export function isDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const defaultColors = await genColors(defaultConfig.frontend.mainView.theme);
export const themeCtx = createContext<TThemeCtx>({
  theme: defaultConfig.frontend.mainView.theme,

  colors: defaultColors,

  toggleTheme: () => undefined,
});
themeCtx.displayName = "ThemeContext";

const ThemeCtxProv = themeCtx.Provider;

export function ThemeCtxProvider({ children }: PropsWithChildren) {
  const app = useContext(appCtx);

  const toggleTheme: TThemeCtx["toggleTheme"] = useCallback(
    (dark?: boolean) => {
      const oldDark =
        app.config.get("frontend.mainView.theme.themeId") === "dark";

      const newDark = dark != null ? dark : !oldDark;
      const themeId = newDark ? "dark" : "light";

      app.config.set("frontend.mainView.theme.followSystem", false); // fixme
      app.config.set("frontend.mainView.theme.themeId", themeId);
    },
    [app.config]
  );

  // region event
  useLayoutEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      toggleTheme(event.matches);
    }

    if (
      window.matchMedia &&
      app.config.get("frontend.mainView.theme.followSystem")
    ) {
      // add listener
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

      matchMedia.addEventListener("change", onChange);
      // endregion

      // region sync to system
      const dark = isDark();
      if (
        dark !=
        (app.config.get("frontend.mainView.theme.themeId") === "dark")
      ) {
        toggleTheme(dark);
      }
      // endregion

      return () => matchMedia.removeEventListener("change", onChange);
    }

    return () => undefined;
  }, [app.config, toggleTheme]);

  useLayoutEffect(() => {
    window.toggleTheme = toggleTheme;
    return () => {
      Reflect.deleteProperty(window, "toggleTheme");
    };
  }, [toggleTheme]);
  // endregion

  // region ctx
  const themeCfg = useMemo(
    () => app.config.get("frontend.mainView.theme"),
    [app.config]
  );

  // region colors
  const [colors, setColors] = useState(defaultColors);
  useEffect(() => {
    async function updateColors() {
      const colors = await genColors(themeCfg);
      if (!canceled) {
        setColors(colors);
      }
    }

    let canceled = false;
    updateColors().then();
    return () => {
      canceled = true;
    };
  }, [themeCfg]);
  // endregion

  const ctx: TThemeCtx = {
    theme: themeCfg,
    colors,
    toggleTheme,
  };
  // endregion

  return <ThemeCtxProv value={ctx}>{children}</ThemeCtxProv>;
}

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    toggleTheme: TThemeCtx["toggleTheme"] | undefined;
  }
}
