/*
 * Copyright 2021-2023 Golden_Water
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
import { appCtx } from "../app/AppCtx";
import { Config } from "../type/rust/config/Config";
import Color from "color";
import { TPropTo } from "../type/TPropTo";
import { backend } from "../app/BackendApi";
import { createGlobalStyle, css, ThemeProvider } from "styled-components";
import { Property } from "csstype";
import { defaultConfig } from "../app/Defaults";

type ThemeConfig = Config["frontend"]["mainView"]["theme"];

export interface TThemeConstants {
  theme: Color;
  thHover: Color;

  bgWindow: Color;
  bgContent: Color;
  bgItem: Color;
  bgHover: Color;
  bgTheme: Color;
  bgThHover: Color;
  bgWarn: Color;
  bgWarnHover: Color;

  txt: Color;
  txtSecond: Color;
  txtBlack: Color;
  txtWhite: Color;

  fnInfo: Color;
  fnSuccess: Color;
  fnWarn: Color;
  fnErr: Color;

  [key: string]: Color;
}

export type TCssConstants = TPropTo<TThemeConstants, Property.Color>;

export async function genConstants(
  themeCfg: ThemeConfig
): Promise<TThemeCtx["consts"]> {
  // region init
  const vibrancyApplied = await backend.isVibrancyApplied();
  const themeColor = Color(themeCfg.themeColor);

  function bl(percent: number) {
    return Color([0, 0, 0, percent], "hsl");
  }

  function wh(percent: number) {
    return Color([0, 0, 100, percent], "hsl");
  }

  function fnWarn(percent: number) {
    return Color([50, 100, 60, percent], "hsl");
  }

  function th(percent: number) {
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

  // endregion

  let themeConstants: TThemeConstants;

  themeConstants = {
    theme: th(1),
    thHover: th(1).lighten(0.2),

    bgWindow: th(1).saturationl(1).lightness(5).alpha(0.32),
    bgContent: th(1).saturationl(1).lightness(10),
    bgItem: th(1).saturationl(1).lightness(15),
    bgHover: th(1).saturationl(1).lightness(25),
    bgTheme: th(1).saturationl(100).lightness(20),
    bgThHover: th(1).saturationl(100).lightness(30),
    bgWarn: fnWarn(1).saturationl(100).lightness(20),
    bgWarnHover: fnWarn(1).saturationl(100).lightness(30),

    txt: wh(1).lightness(95),
    txtSecond: wh(1).lightness(70),
    txtBlack: bl(1).lightness(5),
    txtWhite: wh(1).lightness(95),

    fnInfo: Color([200, 100, 50], "hsl"),
    fnSuccess: Color([145, 100, 42], "hsl"),
    fnWarn: fnWarn(1),
    fnErr: Color([360, 100, 60], "hsl"),
  };
  if (!vibrancyApplied) {
    themeConstants.bgWindow = themeConstants.bgWindow.alpha(1);
  }

  if (themeCfg.themeId !== "dark") {
    themeConstants = {
      ...themeConstants,
      theme: th(1),
      thHover: th(1).lighten(0.2),

      bgWindow: th(1).saturationl(1).lightness(5).alpha(0.32),
      bgContent: th(1).saturationl(1).lightness(10),
      bgItem: th(1).saturationl(1).lightness(15),
      bgHover: th(1).saturationl(1).lightness(25),
      bgTheme: th(1).saturationl(100).lightness(20),
      bgThHover: th(1).saturationl(100).lightness(30),

      txt: wh(1).lightness(95),
      txtSecond: wh(1).lightness(70),
      txtBlack: bl(1).lightness(5),
      txtWhite: wh(1).lightness(95),
    };
    if (!vibrancyApplied) {
      themeConstants.bgWindow = themeConstants.bgWindow.alpha(1);
    }
  }

  return themeConstants2Consts(themeConstants);
}

export interface TThemeCtx {
  theme: ThemeConfig;
  consts: TCssConstants & { raw: TThemeConstants };
  isHorizontal: boolean;
  selectable: boolean;

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

  selectable: false,

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

  const [selectable, setSelectable] = useState(false);
  useLayoutEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Alt") {
        setSelectable(true);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Alt") {
        setSelectable(false);
        window.getSelection()?.empty();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keypress", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
    };
  });
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
    selectable,
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

type StyleFnProps = { theme: TThemeCtx };

export type ColorFn = (p: StyleFnProps) => Property.Color;
type ColorFns = TPropTo<TThemeConstants, ColorFn>;

export const color: ColorFns = {
  theme: (p) => p.theme.consts.theme,
  thHover: (p) => p.theme.consts.thHover,

  bgWindow: (p) => p.theme.consts.bgWindow,
  bgContent: (p) => p.theme.consts.bgContent,
  bgItem: (p) => p.theme.consts.bgItem,
  bgHover: (p) => p.theme.consts.bgHover,
  bgTheme: (p) => p.theme.consts.bgTheme,
  bgThHover: (p) => p.theme.consts.bgThHover,
  bgWarn: (p) => p.theme.consts.bgWarn,
  bgWarnHover: (p) => p.theme.consts.bgWarnHover,

  txt: (p) => p.theme.consts.txt,
  txtSecond: (p) => p.theme.consts.txtSecond,
  txtBlack: (p) => p.theme.consts.txtBlack,
  txtWhite: (p) => p.theme.consts.txtWhite,

  fnInfo: (p) => p.theme.consts.fnInfo,
  fnSuccess: (p) => p.theme.consts.fnSuccess,
  fnWarn: (p) => p.theme.consts.fnWarn,
  fnErr: (p) => p.theme.consts.fnErr,
};

const shadowTransition = css`
  transition: box-shadow 0.1s ease-out;
`;
export const shadow = {
  content: css`
    box-shadow: 0.25rem 0.25rem 1rem rgba(0, 0, 0, 0.5);
  `,

  contentHover: css`
    ${shadowTransition}
    &:hover {
      box-shadow: 0.25rem 0.25rem 1rem rgba(0, 0, 0, 0.5);
    }
  `,

  item: css`
    box-shadow: 0.25rem 0.25rem 0.5rem rgba(0, 0, 0, 0.25);
  `,

  itemHover: css`
    ${shadowTransition}
    &:hover {
      box-shadow: 0.25rem 0.25rem 0.5rem rgba(0, 0, 0, 0.25);
    }
  `,
};

export const font = {
  normal: css`
    font-size: 1rem;
    line-height: 1.1875rem;
    font-weight: 400;

    font-style: normal;
  `,
  second: css`
    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 400;

    font-style: normal;
  `,

  title: css`
    font-size: 2rem;
    line-height: initial;
    font-weight: 500;

    font-style: normal;
  `,
  input: css`
    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 400;

    font-style: normal;
  `,
  userName: css`
    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 500;

    font-style: normal;
  `,
  dmTs: css`
    font-size: 0.75rem;
    line-height: 0.75rem;
    font-weight: 500;

    font-style: normal;
  `,
  dmContent: css`
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 500;

    font-style: normal;
  `,
};

export const radius = {
  small: css`
    border-radius: 0.3125rem;
  `,
  normal: css`
    border-radius: 0.625rem;
  `,
};

export const borderValue = {
  small: "0.0625rem",
  normal: "0.125rem",
};
export const border = {
  small: css`
    border-width: ${borderValue.small};
    border-style: solid;
  `,
  normal: css`
    border-width: ${borderValue.normal};
    border-style: solid;
  `,
};

export const paddingValue = {
  small: "0.3125rem",
  input: "0.5rem",
  normal: "0.625rem",
  window: "0.9375rem",
};
export const padding = {
  small: css`
    padding: ${paddingValue.small};
  `,
  input: css`
    padding: ${paddingValue.input};
  `,
  normal: css`
    padding: ${paddingValue.normal};
  `,
  window: css`
    padding: ${paddingValue.window};
  `,
};

export const dynamicSelect = (p: StyleFnProps) =>
  p.theme.selectable ? "" : "user-select: none";

export const zIndex = {
  popper: css`
    z-index: 100;
  `,
};

export const GlobalStyle = createGlobalStyle`
  body {
    font-size: 0.5cm;
  }

  #root {
    ${font.normal};

    width: 100%;
    height: 100%;
  }

  body {
    font-family: sans-serif;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* prevent overscroll */
  body {
    position: fixed;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
`;
