/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./index.css";

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
