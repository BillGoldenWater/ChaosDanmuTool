/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./share/app/BackendApi.ts";

import "normalize.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { backend } from "./share/app/BackendApi";
import { AppCtxProvider } from "./share/app/AppCtx";
import { GlobalStyle, ThemeCtxProvider } from "./share/component/ThemeCtx";
import React, { StrictMode } from "react";
import { wasm_init } from "chaos_danmu_tool_share";
import { UserInfoCacheProvider } from "./share/app/UserInfoCacheCtx";

wasm_init();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = ReactDOM.createRoot(document.getElementById("root")!);

const config = await backend.getConfig();
const debug = await backend.isDebug();

root.render(
  <StrictMode>
    <AppCtxProvider firstConfig={config}>
      <UserInfoCacheProvider>
        <ThemeCtxProvider>
          <GlobalStyle />
          <App />
        </ThemeCtxProvider>
      </UserInfoCacheProvider>
    </AppCtxProvider>
  </StrictMode>
);

// window.addEventListener("blur", () => {
//   const activeElement = document.activeElement;
//
//   if (activeElement && activeElement.tagName === "INPUT") {
//     (activeElement as HTMLInputElement).blur();
//     (activeElement as HTMLInputElement).focus();
//   }
// });

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
