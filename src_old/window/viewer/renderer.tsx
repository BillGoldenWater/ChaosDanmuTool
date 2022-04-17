/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import ReactDOM from "react-dom";
import { Main } from "./page/main";
import { ApiElectron } from "../preload";

console.log("Rendering");

declare global {
  interface Window {
    electron: ApiElectron;
  }
}

ReactDOM.render(<Main />, document.querySelector("#app"));
