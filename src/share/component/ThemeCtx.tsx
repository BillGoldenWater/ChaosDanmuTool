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
import { ThemeProvider } from "styled-components";

type ThemeConfig = Config["frontend"]["mainView"]["theme"];

export interface TThemeConstants {
  text: Color;
  titleText: Color;
  secondaryText: Color;

  background: Color;

  contentBackground: Color;

  [key: string]: Color;
}

export type TCssConstants = TPropToString<TThemeConstants>;

export interface TThemeCtx {
  theme: ThemeConfig;
  consts: TCssConstants & { raw: TThemeConstants };
  isHorizontal: boolean;
  toggleTheme: (dark?: boolean, fromFollow?: boolean) => void;
}

function themeConstants2Consts(
  themeConstants: TThemeConstants
): TThemeCtx["consts"] {
  const result: TThemeCtx["consts"] = {} as TThemeCtx["consts"];
  for (const key in themeConstants) {
    result[key] = themeConstants[key].hsl().string();
  }
  result.raw = themeConstants;
  return result;
}

export async function genConstants(
  themeCfg: ThemeConfig
): Promise<TThemeCtx["consts"]> {
  const vibrancyApplied = backend ? await backend.isVibrancyApplied() : false;
  const themeColor = Color(themeCfg.themeColor);

  function black(percent: number) {
    return Color([0, 0, 0, percent], "hsl");
  }

  function white(percent: number) {
    return Color([0, 0, 100, percent], "hsl");
  }

  function theme(percent: number) {
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

  let themeConstants: TThemeConstants;

  themeConstants = {
    text: theme(1).desaturate(0.95).lighten(0.9).fade(0.05),
    titleText: theme(1).desaturate(0.95).lighten(0.9).fade(0),
    secondaryText: theme(1).desaturate(0.95).lighten(0.9).fade(0.4),

    background: theme(1).desaturate(0.95).darken(0.8).fade(0.2),

    contentBackground: white(0.075),
  };
  if (!vibrancyApplied) {
    themeConstants.background = themeConstants.background.alpha(1);
  }

  if (themeCfg.themeId !== "dark") {
    themeConstants = {
      text: theme(1).desaturate(0.95).darken(0.9).fade(0.05),
      titleText: theme(1).desaturate(0.95).darken(0.9).fade(0),
      secondaryText: theme(1).desaturate(0.95).darken(0.4),

      background: theme(1).desaturate(0.95).lighten(0.85).fade(0.4),

      contentBackground: white(0.9),
    };
    if (!vibrancyApplied) {
      themeConstants.background = themeConstants.background.alpha(1);
    }
  }

  return themeConstants2Consts(themeConstants);
}

export function isDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function isHorizontal(): boolean {
  return window.innerWidth > window.innerHeight;
}

const defaultConsts = await genConstants(defaultConfig.frontend.mainView.theme);
export const themeCtx = createContext<TThemeCtx>({
  theme: defaultConfig.frontend.mainView.theme,

  consts: defaultConsts,

  isHorizontal: isHorizontal(),

  toggleTheme: () => undefined,
});
themeCtx.displayName = "ThemeContext";

const ThemeCtxProv = themeCtx.Provider;

export function ThemeCtxProvider({ children }: PropsWithChildren) {
  const app = useContext(appCtx);

  const toggleTheme: TThemeCtx["toggleTheme"] = useCallback(
    (dark?: boolean, fromFollow?: boolean) => {
      const oldDark =
        app.config.get("frontend.mainView.theme.themeId") === "dark";

      const newDark = dark != null ? dark : !oldDark;
      const themeId = newDark ? "dark" : "light";

      if (!fromFollow)
        app.config.set("frontend.mainView.theme.followSystem", false);
      app.config.set("frontend.mainView.theme.themeId", themeId);
    },
    [app.config]
  );

  // region event
  useLayoutEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      toggleTheme(event.matches, true);
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
        toggleTheme(dark, true);
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

  const [horizontal, setHorizontal] = useState(
    () => window.innerHeight <= window.innerWidth
  );
  useLayoutEffect(() => {
    function onResize() {
      if (horizontal != isHorizontal()) {
        setHorizontal(isHorizontal());
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [horizontal]);
  // endregion

  // region ctx
  const themeCfg = useMemo(
    () => app.config.get("frontend.mainView.theme"),
    [app.config]
  );

  // region consts
  const [consts, setConsts] = useState(defaultConsts);
  useEffect(() => {
    async function updateConsts() {
      const consts = await genConstants(themeCfg);
      if (!canceled) {
        setConsts(consts);
      }
    }

    let canceled = false;
    updateConsts().then();
    return () => {
      canceled = true;
    };
  }, [themeCfg]);
  // endregion

  const ctx: TThemeCtx = {
    theme: themeCfg,
    consts: consts,
    isHorizontal: horizontal,
    toggleTheme,
  };
  // endregion

  return (
    <ThemeCtxProv value={ctx}>
      <ThemeProvider theme={ctx}>{children}</ThemeProvider>
    </ThemeCtxProv>
  );
}

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    toggleTheme: TThemeCtx["toggleTheme"] | undefined;
  }
}
