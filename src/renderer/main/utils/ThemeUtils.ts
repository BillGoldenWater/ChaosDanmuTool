/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as color from "@ant-design/colors";

const themeColor = color.blue;
const themeColorDark = color.generate(themeColor.primary, { theme: "dark" });
let isDarkTheme = false;

const root = document.documentElement;

const white: string[] = [];
for (let i = 0; i <= 0xff; i++) {
  const d = i.toString(16).padStart(2, "0");
  white.push(`#${d}${d}${d}`);
}

function set(key: string, value: number) {
  const start = isDarkTheme ? 0x00 : 0xff;
  const offset = Math.round(value * 0xff);
  const target = isDarkTheme ? start + offset : start - offset;
  root.style.setProperty(key, white[target]);
}

function setWithTheme(
  key: string,
  value: number,
  color: string = isDarkTheme ? themeColorDark[5] : themeColor.primary
) {
  const offset = Math.round(value * 0xff);
  root.style.setProperty(key, color + offset.toString(16).padStart(2, "0"));
}

export function toggleDarkMode(isDark = !isDarkTheme) {
  isDarkTheme = isDark;

  root.style.setProperty("--infoTextColor", color.blue.primary);
  root.style.setProperty("--successColor", color.green.primary);
  root.style.setProperty("--warningColor", color.yellow.primary);
  root.style.setProperty("--errorColor", color.red[4]);

  root.style.setProperty("--contentBorderRadius", "0.6em");
  root.style.setProperty("--itemBorderRadius", "0.3em");

  root.style.setProperty("--spacerWidth", "1em");

  setWithTheme("--selectedTextColor", 0.9);
  setWithTheme("--itemSelectedBackgroundColor", 0.15);
  setWithTheme("--itemSelectedHoverBackgroundColor", 0.3);
  setWithTheme("--itemSelectedActiveBackgroundColor", 0.25);

  if (isDarkTheme) {
    set("--titleTextColor", 0.95);
    set("--primaryTextColor", 0.9);
    set("--secondaryTextColor", 0.6);
    set("--disableColor", 0.5);

    set("--backgroundColor", 0.05);
    set("--contentBackgroundColor", 0.15);
    set("--itemHoverBackgroundColor", 0.3);
    set("--itemActiveBackgroundColor", 0.25);
  } else {
    set("--titleTextColor", 0.95);
    set("--primaryTextColor", 0.9);
    set("--secondaryTextColor", 0.6);
    set("--disableColor", 0.5);

    set("--backgroundColor", 0.15);
    set("--contentBackgroundColor", 0.05);
    set("--itemHoverBackgroundColor", 0.15);
    set("--itemActiveBackgroundColor", 0.1);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.toggleDarkMode = toggleDarkMode;
