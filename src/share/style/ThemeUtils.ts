/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { writable } from "svelte/store";
import Color from "color";

type ColorPlates = {
  text: string;

  background: string;
};

const defaultThemeColor: Color = new Color("hsl(200, 100%, 50%)");
const genColorPlates = (themeColor: Color): ColorPlates => {
  function down(percent: number) {
    return new Color([0, 0, 0, percent], "hsl");
  }

  function up(percent: number) {
    return new Color([0, 0, 100, percent], "hsl");
  }

  function theme(percent: number) {
    return new Color(
      [
        themeColor.hue(),
        themeColor.saturationl(),
        themeColor.lightness(),
        percent,
      ],
      "hsl"
    );
  }

  console.log(theme(0.01).toString());
  return {
    text: up(0.9).toString(),

    background: theme(0.01).desaturate(0.85).darken(0.8).alpha(0.3).toString(),
  };
};

const themeColor = writable(defaultThemeColor);

export const colorPlates = writable(genColorPlates(defaultThemeColor));

themeColor.subscribe((tc) => {
  colorPlates.set(genColorPlates(tc));
});
