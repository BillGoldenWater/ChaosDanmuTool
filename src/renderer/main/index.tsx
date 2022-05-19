/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { App } from "./App";
import { createRoot } from "react-dom/client";

console.log("Rendering");

createRoot(document.querySelector("#app")).render(<App />);
