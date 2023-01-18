/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from "child_process";
import fs from "fs/promises";

let hasErr = false;

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined) {
  console.log(`running ${command}`);
  try {
    return execSync(command, { cwd, stdio: "inherit" });
  } catch (e) {
    hasErr = true;
  }
}

/**
 * @param {string} msg
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

/**
 * @param {string} target
 */
function clippy(target) {
  execCommand(`cargo clippy -r --target ${target} -- -Dwarnings`, "src-tauri");
}

export async function main() {
  await import("./rustupAddTargets.mjs");

  // region clippy
  highlightLog("cargo clippy");

  await fs.rm("src/share/type/rust", { recursive: true, force: true });
  switch (process.platform) {
    case "darwin": {
      clippy("x86_64-apple-darwin");
      clippy("aarch64-apple-darwin");
      break;
    }
    case "linux": {
      clippy("x86_64-unknown-linux-gnu");
      break;
    }
    case "win32": {
      clippy("x86_64-pc-windows-msvc");
      break;
    }
  }

  if (hasErr) {
    process.exit(1);
  }
  // endregion
}

main().then();
