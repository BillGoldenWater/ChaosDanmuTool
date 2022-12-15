/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./share/app/BackendApi.ts";

import "./index.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { backend } from "./share/app/BackendApi";
import { AppCtxProvider, defaultConfig } from "./share/app/AppCtx";
import { ThemeCtxProvider } from "./share/component/ThemeCtx";
import React from "react";
import { WindowCtxProvider } from "./share/component/WindowCtx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = ReactDOM.createRoot(document.getElementById("root")!);

const config = backend ? await backend.getConfig() : defaultConfig;
const debug = backend ? await backend.isDebug() : true;

root.render(
  <WindowCtxProvider>
    <AppCtxProvider debug={debug} firstConfig={config}>
      <ThemeCtxProvider>
        <App />
      </ThemeCtxProvider>
    </AppCtxProvider>
  </WindowCtxProvider>
);

if (debug) {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.ctrlKey) {
        // @ts-ignore
        let zoom = parseFloat(document.body.style.zoom);
        if (isNaN(zoom)) zoom = 1.0;

        switch (e.key) {
          case "=":
          case "+": {
            // @ts-ignore
            zoom *= 1.2;
            break;
          }
          case "-": {
            zoom *= 0.8;
            break;
          }
          case "0": {
            zoom = 1.0;
            break;
          }
        }

        // @ts-ignore
        document.body.style.zoom = zoom.toString();
      }
    },
    true
  );
}
