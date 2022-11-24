/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MainPage } from "./main/MainPage";
import { ViewerPage } from "./viewer/ViewerPage";
import React from "react";

export interface TPage {
  pageId: "main" | "viewer";
  page: () => JSX.Element;
}

export const pages: TPage[] = [
  { pageId: "main", page: () => <MainPage /> },
  { pageId: "viewer", page: () => <ViewerPage /> },
];
