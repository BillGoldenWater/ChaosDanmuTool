/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {spawnSync} from "child_process";
import fs from "fs/promises";

/**
 * @param command {string}
 * @param args {string[]}
 * @param cwd {string}
 */
function execCommand(command, args, cwd = undefined,) {
    console.log(`running ${command}`, args)
    return spawnSync(command, args, {cwd, stdio: 'inherit',})
}

async function main() {
    await fs.rm("src/share/type/rust", {recursive: true, force: true})
    execCommand("cargo", ["test"], "src-tauri")

    if (process.platform === "darwin") {
        execCommand("rustup", ["target", "add", "x86_64-apple-darwin", "aarch64-apple-darwin"])
    }
}

main().then()
