/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "./index.css";
import "../share/style/ThemeUtils.ts";
import "../share/style/variable.less";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
