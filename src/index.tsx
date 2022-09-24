/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import "../share/style/ThemeUtils.ts";
// import "../share/style/variable.less";
import "./share/backendApi.ts";

import "./index.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";

let root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
