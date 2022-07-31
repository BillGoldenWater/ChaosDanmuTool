/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";

async function main() {
    // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version

    await fs.rm("out", {recursive: true, force: true})
    await fs.mkdir("out")

    switch (process.platform) {
        case "darwin": {
            const target = "universal-apple-darwin"
            const pkgPath =
                `src-tauri/target/${target}/release/bundle/dmg/ChaosDanmuTool_${version}_universal.dmg`
            const updatePkgPath =
                `src-tauri/target/${target}/release/bundle/macos/ChaosDanmuTool.app.tar.gz`
            const sigPath =
                `src-tauri/target/${target}/release/bundle/macos/ChaosDanmuTool.app.tar.gz.sig`

            await fs.copyFile(pkgPath, `out/macos/ChaosDanmuTool_${version}_universal.dmg`)
            await fs.copyFile(updatePkgPath, `out/macos/ChaosDanmuTool_${version}_universal.update.tar.gz`)
            await fs.copyFile(sigPath, `out/macos/ChaosDanmuTool_${version}_universal.update.sig`)

            break
        }
        case "linux": {
            const target = "x86_64-unknown-linux-gnu"
            const pkgPath =
                `src-tauri/target/${target}/release/bundle/deb/chaos-danmu-tool_${version}_amd64.deb`
            const updatePkgPath =
                `src-tauri/target/${target}/release/bundle/appimage/chaos-danmu-tool_${version}_amd64.AppImage.tar.gz`
            const sigPath =
                `src-tauri/target/${target}/release/bundle/appimage/chaos-danmu-tool_${version}_amd64.AppImage.tar.gz.sig`

            await fs.copyFile(pkgPath, `out/linux/chaos-danmu-tool_${version}_amd64.deb`)
            await fs.copyFile(updatePkgPath, `out/linux/chaos-danmu-tool_${version}_amd64.update.tar.gz`)
            await fs.copyFile(sigPath, `out/linux/chaos-danmu-tool_${version}_amd64.update.sig`)

            break
        }
        case "win32": {
            const tauriConfig = JSON.parse((await fs.readFile("./src-tauri/tauri.conf.json")).toString())
            // noinspection JSUnresolvedVariable
            const wL = tauriConfig?.tauri?.bundle?.windows?.wix?.language || "en-US"

            const target = "x86_64-pc-windows-msvc"
            const pkgPath =
                `src-tauri/target/${target}/release/bundle/msi/ChaosDanmuTool_${version}_x64_${wL}.msi`
            const updatePkgPath =
                `src-tauri/target/${target}/release/bundle/msi/ChaosDanmuTool_${version}_x64_${wL}.update.zip`
            const sigPath =
                `src-tauri/target/${target}/release/bundle/msi/ChaosDanmuTool_${version}_x64_${wL}.msi.zip.sig`

            await fs.copyFile(pkgPath, `out/windows/ChaosDanmuTool_${version}_x64_${wL}.msi`)
            await fs.copyFile(updatePkgPath, `out/windows/ChaosDanmuTool_${version}_x64_${wL}.update.zip`)
            await fs.copyFile(sigPath, `out/windows/ChaosDanmuTool_${version}_x64_${wL}.update.sig`)

            break
        }
    }
}

main().then()