/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from "child_process";
import fs from "fs/promises";

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

export async function main() {
  // region test
  highlightLog("cargo test");

  await fs.rm("src/share/type/rust", { recursive: true, force: true });
  switch (process.platform) {
    case "darwin": {
      execCommand(
        "cargo test --release --target x86_64-apple-darwin",
        "src-tauri"
      );
      if (process.arch === "arm64") {
        execCommand(
          "cargo test --release --target aarch64-apple-darwin",
          "src-tauri"
        );
      }
      break;
    }
    case "linux": {
      execCommand(
        "cargo test --release --target x86_64-unknown-linux-gnu",
        "src-tauri"
      );
      break;
    }
    case "win32": {
      execCommand(
        "cargo test --release --target x86_64-pc-windows-msvc",
        "src-tauri"
      );
      break;
    }
  }
  // endregion
}

main().then();
