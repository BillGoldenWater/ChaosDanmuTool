/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {execSync} from "child_process";

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined,) {
    console.log(`running ${command}`)
    return execSync(command, {cwd, stdio: 'inherit',})
}

async function main() {
    switch (process.platform) {
        case "darwin": {
            execCommand("yarn tauri build -t universal-apple-darwin")
            break
        }
        case "linux": {
            execCommand("yarn tauri build -t x86_64-unknown-linux-gnu")
            break
        }
        case "win32": {
            execCommand("yarn tauri build -t x86_64-pc-windows-msvc")
            break
        }
    }
}

main().then()