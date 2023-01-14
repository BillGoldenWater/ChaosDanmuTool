/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

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
  // region add macOS targets
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

  // region install tool
  highlightLog("install cargo tauri-cli");

  execCommand("cargo install tauri-cli");
  // endregion

  // region rm last bundle output
  highlightLog("rm last bundle output");

  try {
    const bundleDirs = (await fs.readdir("src-tauri/target"))
      .filter((name) => name !== "release" && name !== "debug")
      .map((name) =>
        path.join("src-tauri", "target", name, "release", "bundle")
      );
    for (const dir of bundleDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (e) {}
    }
  } catch (e) {}
  // endregion

  await import("./test.mjs");
}

main().then();
