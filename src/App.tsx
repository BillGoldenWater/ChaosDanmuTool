/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext, useMemo } from "react";
import { appCtx } from "./share/app/AppCtx";
import { pages, TWindow } from "./page/Page";

export function App() {
  const ctx = useContext(appCtx);

  return useMemo(
    () =>
      (
        pages.find((it) => it.windowId == ctx.params.windowId) as TWindow
      ).window(),
    [ctx.params.windowId]
  );
}
