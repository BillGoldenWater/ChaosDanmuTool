/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/renderer/main/index.html",
              js: "./src/renderer/main/index.tsx",
              name: "main_window",
              preload: {
                js: "./src/rendererShare/preload.ts",
              },
            },
            {
              html: "./src/renderer/viewer/index.html",
              js: "./src/renderer/viewer/index.tsx",
              name: "viewer",
            },
          ],
        },
        devContentSecurityPolicy: "connect-src *;",
      },
    ],
  ],
};
