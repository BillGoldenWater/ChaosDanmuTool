/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";
import path from "path";

/**
 * @param {string} dir
 */
async function printDir(dir) {
    for (let it of (await fs.readdir(dir))) {
        it = path.join(dir, it)
        let stat = await fs.stat(it)
        if (stat.isFile()) {
            console.log(`f: ${it}`)
        } else if (stat.isDirectory()) {
            console.log(`d: ${it}`)
            await printDir(it)
        }
    }
}

async function main() {
    // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version

    await fs.rm("out", {recursive: true, force: true})
    await fs.mkdir("out")

    switch (process.platform) {
        case "darwin": {
            const dmgPath =
                `src-tauri/target/universal-apple-darwin/release/bundle/dmg/ChaosDanmuTool_${version}_universal.dmg`
            const updatePkgPath =
                `src-tauri/target/universal-apple-darwin/release/bundle/macos/ChaosDanmuTool.app.tar.gz`
            const sigPath =
                `src-tauri/target/universal-apple-darwin/release/bundle/macos/ChaosDanmuTool.app.tar.gz.sig`

            await fs.copyFile(dmgPath, `out/ChaosDanmuTool_${version}_universal.dmg`)
            await fs.copyFile(updatePkgPath, `out/ChaosDanmuTool_${version}_universal.update.tar.gz`)
            await fs.copyFile(sigPath, `out/ChaosDanmuTool_${version}_universal.update.sig`)

            break
        }
        case "linux": {

            await printDir("src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/")

            break
        }
        case "win32": {

            await printDir("src-tauri/target/x86_64-pc-windows-msvc/release/bundle/")

            break
        }
    }
}

main().then()