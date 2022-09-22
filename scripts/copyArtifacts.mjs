/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";
import path from "path";

const APP_NAME = "ChaosDanmuTool";

/**
 * @typedef {Object} BuildInfo
 * @property {string} versionInfo something like "aarch64-apple-darwin|darwin-aarch64|0.10.0"
 * @property {string} pkgFile spilt path by / and use | to set final extension name. e.g. "path/to/pkg.zip|zip"
 * @property {string} updatePkgFile spilt path by / and use | to set final extension name. e.g. "path/to/pkg.zip|zip"
 */

/**
 * @param {string} platform
 * @param {BuildInfo[]} buildInfos
 */
async function copy(platform, buildInfos) {
  let updateInfo = {};

  for (const buildInfo of buildInfos) {
    // region destruct
    const { versionInfo, pkgFile, updatePkgFile } = buildInfo;
    const [target, updateTarget, version] = versionInfo.split("|");
    const [pkgFilePath, pkgExt] = pkgFile.split("|");
    const [updatePkgFilePath, updatePkgExt] = updatePkgFile.split("|");
    // endregion

    // region construct path
    const bundleDirPath = path.join(
      "src-tauri",
      "target",
      target,
      "release",
      "bundle"
    );

    const pkgPath = path.join(bundleDirPath, ...pkgFilePath.split("/"));
    const updatePkgPath = path.join(
      bundleDirPath,
      ...updatePkgFilePath.split("/")
    );
    const sigPath = `${updatePkgPath}.sig`;
    // endregion

    // region normalized file names
    let pkg = `${APP_NAME}_${updateTarget}_v${version}.${pkgExt}`;
    let updatePkg = `${updateTarget}_update.${updatePkgExt}`;
    // endregion

    // region copy to out
    const outPkgPath = `out/${pkg}`;
    const outUpdatePkgPath = `out/${updatePkg}`;

    await fs.copyFile(pkgPath, outPkgPath);
    await fs.copyFile(updatePkgPath, outUpdatePkgPath);
    // endregion

    // region update info
    const signature = (await fs.readFile(sigPath)).toString();
    updateInfo[updateTarget] = {
      signature: signature,
      url: `https://github.com/BiliGoldenWater/ChaosDanmuTool/releases/download/${version}/${updatePkg}`,
    };
    // endregion
  }

  await fs.writeFile(`out/${platform}.json`, JSON.stringify(updateInfo));
}

async function main() {
  /**
   * @type string
   */
  // noinspection JSFileReferences
  const version = JSON.parse(
    (await fs.readFile("./package.json")).toString()
  ).version;

  await fs.rm("out", { recursive: true, force: true });
  await fs.mkdir("out");

  switch (process.platform) {
    case "darwin": {
      await copy("macos", [
        {
          versionInfo: `x86_64-apple-darwin|darwin-x86_64|${version}`,
          pkgFile: `dmg/ChaosDanmuTool_${version}_x64.dmg|dmg`,
          updatePkgFile: "macos/ChaosDanmuTool.app.tar.gz|tar.gz",
        },
        {
          versionInfo: `aarch64-apple-darwin|darwin-aarch64|${version}`,
          pkgFile: `dmg/ChaosDanmuTool_${version}_aarch64.dmg|dmg`,
          updatePkgFile: "macos/ChaosDanmuTool.app.tar.gz|tar.gz",
        },
      ]);
      break;
    }
    case "linux": {
      await copy("linux", [
        {
          versionInfo: `x86_64-unknown-linux-gnu|linux-x86_64|${version}`,
          pkgFile: `deb/chaos-danmu-tool_${version}_amd64.deb|deb`,
          updatePkgFile: `appimage/chaos-danmu-tool_${version}_amd64.AppImage.tar.gz|tar.gz`,
        },
      ]);
      break;
    }
    case "win32": {
      const tauriConfig = JSON.parse(
        (await fs.readFile("./src-tauri/tauri.conf.json")).toString()
      );
      // noinspection JSUnresolvedVariable
      const wL = tauriConfig?.tauri?.bundle?.windows?.wix?.language || "en-US";

      await copy("windows", [
        {
          versionInfo: `x86_64-pc-windows-msvc|windows-x86_64|${version}`,
          pkgFile: `msi/ChaosDanmuTool_${version}_x64_${wL}.msi|msi`,
          updatePkgFile: `msi/ChaosDanmuTool_${version}_x64_${wL}.msi.zip|zip`,
        },
      ]);
      break;
    }
  }
}

main().then();
