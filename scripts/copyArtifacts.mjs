/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";

/**
 * @param {string} target
 * @param {{version: string, platforms: string[]}} updateInfo
 * @param {string} pkgFolder
 * @param {string} updatePkgFolder
 * @param {string} pkgFileName
 * @param {string} updatePkgFileName
 */
async function copy(target, updateInfo, pkgFolder, updatePkgFolder, pkgFileName, updatePkgFileName) {
    const pkgPath =
        `src-tauri/target/${target}/release/bundle/${pkgFolder}/${pkgFileName}`
    const updatePkgPath =
        `src-tauri/target/${target}/release/bundle/${updatePkgFolder}/${updatePkgFileName}`
    const sigPath =
        `src-tauri/target/${target}/release/bundle/${updatePkgFolder}/${updatePkgFileName}.sig`

    const outPkgPath = `out/${pkgFileName}`;
    const outUpdatePkgPath = `out/${updatePkgFileName}`;
    const sig = (await fs.readFile(sigPath)).toString()

    await fs.copyFile(pkgPath, outPkgPath)
    await fs.copyFile(updatePkgPath, outUpdatePkgPath)

    let info = {};
    for (let platform of updateInfo.platforms) {
        info[platform] = {
            "signature": sig,
            "url": `https://github.com/BiliGoldenWater/ChaosDanmuToo/releases/download/${updateInfo.version}/${pkgFileName}`
        }
    }
    await fs.writeFile(`out/${target}.json`, JSON.stringify(info));
}

async function main() {
    /**
     * @type string
     */
        // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version

    await fs.rm("out", {recursive: true, force: true})
    await fs.mkdir("out")

    switch (process.platform) {
        case "darwin": {
            await copy(
                "universal-apple-darwin",
                {platforms: ["darwin-x86_64", "darwin-aarch64"], version},
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
                {platforms: ["linux-x86_64"], version},
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
                {platforms: ["windows-x86_64"], version},
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