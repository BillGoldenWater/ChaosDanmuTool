/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// unused

import { execSync } from "child_process";

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined) {
  console.log(`running ${command}`);
  return execSync(command, { cwd, stdio: "inherit" });
}

/**
 * @param {string} msg
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

async function main() {
  highlightLog("cloning tao");
  execCommand("git clone https://github.com/BiliGoldenWater/tao ../tao");
  highlightLog("cloning tauri");
  execCommand("git clone https://github.com/BiliGoldenWater/tauri ../tauri");
}

main().then();
