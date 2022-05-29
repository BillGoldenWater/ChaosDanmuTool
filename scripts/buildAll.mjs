import { execSync } from "child_process";
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
  { arch: "x64", platform: "win32" },
  { arch: "arm64", platform: "win32" },
  { arch: "x64", platform: "linux" },
  { arch: "arm64", platform: "linux" },

  { arch: "universal", platform: "darwin" },
];

/**
 * @param msg : string
 */
function highlightLog(msg) {
  console.log(`\u001b[94m${msg}\u001b[0m`);
}

let num = 1;
for (let buildOption of buildOptions) {
  highlightLog(
    `Building for ${buildOption.platform} ${buildOption.arch} (${num++}/${
      buildOptions.length
    })`
  );
  execSync(`yarn package -a ${buildOption.arch} -p ${buildOption.platform}`, {
    stdio: "inherit",
  });
}

const pkg = JSON.parse(fs.readFileSync("package.json", { encoding: "utf8" }));

fs.readdirSync("out", { withFileTypes: true }).forEach((info) => {
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

    highlightLog(`${zipName} compressing`);
    crossZip.zipSync(appDir, zipName);
    highlightLog(`${zipName} done`);
  }
});
