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
    s(`--${key}`, colorPlates[key]);
  });
}

type ThemeSettings = {
  themeColor: Color;
  dark: boolean;
};

type ColorPlates = {
  text: string;

  background: string;

  up: string;
  upDouble: string;
  down: string;
  downDouble: string;

  themeSolid: string;
};

const defaultThemeSettings: ThemeSettings = {
  themeColor: new Color("hsl(200, 100%, 50%)"),
  dark: true,
};

const genColorPlates = (themeSettings: ThemeSettings): ColorPlates => {
  let tc = themeSettings.themeColor;

  function down(percent: number) {
    return new Color([0, 0, 0, percent], "hsl");
  }

  function up(percent: number) {
    return new Color([0, 0, 100, percent], "hsl");
  }

  function theme(percent: number) {
    return new Color(
      [tc.hue(), tc.saturationl(), tc.lightness(), percent],
      "hsl"
    );
  }

  return {
    text: up(0.9).toString(),

    background: theme(1).desaturate(0.9).darken(0.9).alpha(0.95).toString(),

    up: theme(1).desaturate(0.9).lighten(0.9).alpha(0.1).toString(),
    upDouble: theme(1).desaturate(0.9).lighten(0.9).alpha(0.2).toString(),
    down: theme(1).desaturate(0.9).darken(0.9).alpha(0.1).toString(),
    downDouble: theme(1).desaturate(0.9).darken(0.9).alpha(0.2).toString(),

    themeSolid: theme(1).toString(),
  };
};

const themeSettings = writable(defaultThemeSettings);

themeSettings.subscribe((themeSettings) => {
  updateVariables(genColorPlates(themeSettings));
});
