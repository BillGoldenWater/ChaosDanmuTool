/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MainWindow } from "./main/MainWindow";
import { ViewerWindow } from "./viewer/ViewerWindow";
import React from "react";

export interface TWindow {
  windowId: "main" | "viewer";
  window: () => JSX.Element;
}

export const pages: TWindow[] = [
  { windowId: "main", window: () => <MainWindow /> },
  { windowId: "viewer", window: () => <ViewerWindow /> },
];
