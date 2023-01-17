/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
  // region add targets
  highlightLog("add targets");

  switch (process.platform) {
    case "darwin": {
      execCommand("rustup target add x86_64-apple-darwin aarch64-apple-darwin");
      break;
    }
    case "linux": {
      execCommand("rustup target add x86_64-unknown-linux-gnu");
      break;
    }
    case "win32": {
      execCommand("rustup target add x86_64-pc-windows-msvc");
      break;
    }
  }
  // endregion
}

main().then();
