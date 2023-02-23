/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext, useMemo } from "react";
import { appCtx } from "./share/app/AppCtx";
import { windows, TWindow } from "./window/Window";

export function App() {
  const ctx = useContext(appCtx);

  return useMemo(
    () =>
      (
        windows.find((it) => it.windowId == ctx.params.windowId) as TWindow
      ).window(),
    [ctx.params.windowId]
  );
}
