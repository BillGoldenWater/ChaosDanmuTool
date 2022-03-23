import {execSync} from "child_process";
import * as fs from "fs";
import AdmZip from "adm-zip";
import crossZip from "cross-zip";
import * as path from "path";

class BuildOption {
    /** @type string */
    arch;
    /** @type string */
    platform;
}

/** @type BuildOption[] */
const buildOptions = [
    {
        arch: "x64",
        platform: "win32",
    },
    {
        arch: "x64",
        platform: "linux",
    },
    {
        arch: "x64",
        platform: "darwin",
    },
    {
        arch: "arm64",
        platform: "win32",
    },
    {
        arch: "arm64",
        platform: "linux",
    },
    {
        arch: "arm64",
        platform: "darwin",
    },
];

let num = 1
for (let buildOption of buildOptions) {
    console.log(`Building for ${buildOption.platform} ${buildOption.arch} (${num++}/${buildOptions.length})`);
    execSync(`yarn package -a ${buildOption.arch} -p ${buildOption.platform}`, {
        stdio: "inherit",
    });
}

const pkg = JSON.parse(fs.readFileSync("package.json", {encoding: "utf8"}));

//region use script for launch and sign
const darwin_arm64_app_path =
    path.join("out", "ChaosDanmuTool-darwin-arm64", "ChaosDanmuTool.app")
const darwin_arm64_exec_path =
    path.join(darwin_arm64_app_path, "Contents", "MacOS", "ChaosDanmuTool")
const darwin_arm64_exec_origin_suffix_path = ".origin"
const darwin_arm64_exec_origin_path =
    path.join(darwin_arm64_app_path, "Contents", "MacOS", `ChaosDanmuTool${darwin_arm64_exec_origin_suffix_path}`)

fs.renameSync(darwin_arm64_exec_path, darwin_arm64_exec_origin_path)
fs.writeFileSync(darwin_arm64_exec_path, "#!/bin/sh\n" +
    `exec "\${0}${darwin_arm64_exec_origin_suffix_path}"`, {encoding: "utf-8"})
execSync(`chmod +x ${darwin_arm64_exec_path}`)
//endregion

fs.readdirSync("out", {withFileTypes: true}).forEach(info => {
    const dir = info.name;

    if (info.isDirectory()) {
        fs.copyFileSync("COPYING", path.join("out", dir, "COPYING"));

        const appDir = path.join("out", dir);

        /**
         * @param {string} entryName
         */
        function del(entryName) {
            fs.rmSync(path.join(appDir, entryName));
        }

        const zip = new AdmZip();
        zip.addLocalFolder(appDir);
        zip.forEach(function (fileInfo) {
            if (fileInfo.entryName.endsWith(".js.map")) {
                del(fileInfo.entryName);
            } else if (fileInfo.entryName.endsWith(".DS_Store")) {
                del(fileInfo.entryName);
            } else if (fileInfo.entryName === "version") {
                del(fileInfo.entryName);
            }
        });

        const zipName = `${dir}-${pkg.version}.zip`;

        console.log(`${zipName} compressing`);
        crossZip.zipSync(appDir, zipName);
        console.log(`${zipName} done`);
    }
});

