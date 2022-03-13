/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/*
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
              html: "./src/window/main/index.html",
              js: "./src/window/main/renderer.tsx",
              name: "main_window",
              preload: {
                js: "./src/window/main/preload.ts",
              },
            },
            {
              html: "./src/window/viewer/index.html",
              js: "./src/window/viewer/renderer.tsx",
              name: "viewer",
            },
          ],
        },
        devContentSecurityPolicy: "connect-src *;",
      },
    ],
  ],
};
