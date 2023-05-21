/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from "react";
import { useAppCtx } from "./share/app/AppCtx";
import { TWindow, windows } from "./window/Window";

export function App() {
  const ctx = useAppCtx();

  return useMemo(
    () =>
      (
        windows.find((it) => it.windowId == ctx.params.windowId) as TWindow
      ).window(),
    [ctx.params.windowId]
  );
}
