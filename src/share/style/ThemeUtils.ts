/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { writable } from "svelte/store";
import Color from "color";

const root = document.documentElement;

function s(key: string, value: string) {
  root.style.setProperty(key, value);
}

function g(key: string): string {
  return root.style.getPropertyValue(key);
}

function updateVariables(colorPlates: ColorPlates) {
  console.log(colorPlates);
  Object.keys(colorPlates).forEach((key) => {
    s(`--${key}`, colorPlates[key].toString());
  });
}

type ThemeSettings = {
  themeColor: Color;
  dark: boolean;
};

type ColorPlates = {
  text: Color;

  background: Color;

  up: Color;
  upDouble: Color;
  down: Color;
  downDouble: Color;

  theme: Color;
  themeDouble: Color;
  themeDown: Color;

  themeSolid: Color;
  themeText: Color;
};

const defaultThemeSettings: ThemeSettings = {
  themeColor: new Color("hsl(200, 100%, 50%)"),
  dark: true,
};

const genColorPlates = (themeSettings: ThemeSettings): ColorPlates => {
  let tc = themeSettings.themeColor;

  function getDown(percent: number) {
    return new Color([0, 0, 0, percent], "hsl");
  }

  function getUp(percent: number) {
    return new Color([0, 0, 100, percent], "hsl");
  }

  function getTheme(percent: number) {
    return new Color(
      [tc.hue(), tc.saturationl(), tc.lightness(), percent],
      "hsl"
    );
  }

  let text = getUp(0.9);

  let background = getTheme(1).desaturate(0.9).darken(0.9).alpha(0.8);

  let up = getUp(0.1);
  let upDouble = getUp(0.2);
  let down = getDown(0.1);
  let downDouble = getDown(0.2);

  let theme = getTheme(0.1);
  let themeDouble = getTheme(0.2);
  let themeDown = getTheme(0.1).mix(down);

  let themeSolid = getTheme(1);
  let themeText = getTheme(0.9);

  if (!themeSettings.dark) {
    text = getDown(0.9);

    background = getTheme(1).desaturate(0.97).lighten(0.6).alpha(0.8);

    up = getUp(0.4);
    upDouble = getUp(0.8);
    down = getDown(0.4);
    downDouble = getDown(0.8);

    theme = getTheme(0.1);
    themeDouble = getTheme(0.2);
    themeDown = getTheme(0.1).mix(down);

    themeSolid = getTheme(1);
    themeText = getTheme(0.9);
  }

  return {
    text: text,
    background: background,
    up: up,
    upDouble: upDouble,
    down: down,
    downDouble: downDouble,
    theme: theme,
    themeDouble: themeDouble,
    themeDown: themeDown,
    themeSolid: themeSolid,
    themeText: themeText,
  };
};

const themeSettings = writable(defaultThemeSettings);

let currentSettings: ThemeSettings = undefined;
themeSettings.subscribe((themeSettings) => {
  updateVariables(genColorPlates(themeSettings));
  currentSettings = themeSettings;
});

// @ts-ignore
window.toggleTheme = function () {
  currentSettings && (currentSettings.dark = !currentSettings.dark);
  themeSettings.set(currentSettings);
};
