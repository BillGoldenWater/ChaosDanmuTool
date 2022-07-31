/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {execSync} from "child_process";
import fs from "fs/promises";
import path from "path";

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined,) {
    console.log(`running ${command}`)
    return execSync(command, {cwd, stdio: 'inherit',})
}

/**
 * @param {string} msg
 */
function highlightLog(msg) {
    console.log(`\u001b[94m${msg}\u001b[0m`);
}

async function main() {
    // region test
    highlightLog("cargo test")

    await fs.rm("src/share/type/rust", {recursive: true, force: true})
    execCommand("cargo test", "src-tauri")
    // endregion

    // region add macOS targets
    highlightLog("add targets")

    if (process.platform === "darwin") {
        execCommand("rustup target add x86_64-apple-darwin aarch64-apple-darwin")
    }
    // endregion

    // region rm last bundle output
    highlightLog("rm last bundle output")

    const bundleDirs = (await fs.readdir("src-tauri/target"))
        .map(name => path.join("src-tauri", "target", name, "release", "bundle"))
    for (const dir of bundleDirs) {
        try {
            await fs.rm(dir, {recursive: true, force: true})
        } catch (e) {
        }
    }
    // endregion
}

main().then()
