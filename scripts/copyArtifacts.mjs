/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";

async function copy(target, pkgFolder, updatePkgFolder, pkgFileName, updatePkgFileName) {
    const pkgPath =
        `src-tauri/target/${target}/release/bundle/${pkgFolder}/${pkgFileName}`
    const updatePkgPath =
        `src-tauri/target/${target}/release/bundle/${updatePkgFolder}/${updatePkgFileName}`
    const sigPath =
        `src-tauri/target/${target}/release/bundle/${updatePkgFolder}/${updatePkgFileName}.sig`

    await fs.copyFile(pkgPath, `out/${pkgFileName}`)
    await fs.copyFile(updatePkgPath, `out/${updatePkgFileName}`)
    await fs.copyFile(sigPath, `out/${updatePkgFileName}.sig`)
}

async function main() {
    // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version

    await fs.rm("out", {recursive: true, force: true})
    await fs.mkdir("out")
    await fs.mkdir("out/macos")
    await fs.mkdir("out/linux")
    await fs.mkdir("out/windows")

    switch (process.platform) {
        case "darwin": {
            await copy(
                "universal-apple-darwin",
                "dmg",
                "macos",
                `ChaosDanmuTool_${version}_universal.dmg`,
                "ChaosDanmuTool.app.tar.gz"
            )
            break
        }
        case "linux": {
            await copy(
                "x86_64-unknown-linux-gnu",
                "deb",
                "appimage",
                `chaos-danmu-tool_${version}_amd64.deb`,
                `chaos-danmu-tool_${version}_amd64.AppImage.tar.gz`
            )
            break
        }
        case "win32": {
            const tauriConfig = JSON.parse((await fs.readFile("./src-tauri/tauri.conf.json")).toString())
            // noinspection JSUnresolvedVariable
            const wL = tauriConfig?.tauri?.bundle?.windows?.wix?.language || "en-US"

            await copy(
                "x86_64-pc-windows-msvc",
                "msi",
                "msi",
                `ChaosDanmuTool_${version}_x64_${wL}.msi`,
                `ChaosDanmuTool_${version}_x64_${wL}.msi.zip`
            )
            break
        }
    }
}

main().then()