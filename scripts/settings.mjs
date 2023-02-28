/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import path from "path";

export const settings = {
  typeGenPath: "frontend/src/share/type/rust",
  cargoTools: ["tauri-cli"],
  frontendDir: "frontend",
  backendDir: "backend",

  frontendFile: (file) => path.join("frontend", file),
  backendFile: (file) => path.join("backend", file),
};
