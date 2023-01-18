import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
import { join as pathJoin } from "path";

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined) {
  return execSync(command, { cwd });
}

/**
 * @param {string} id
 * @return {string}
 */
function getCargoCrateVersion(id) {
  const p = execCommand(`cargo search ${id}`);
  return p
    .toString()
    .trim()
    .replaceAll(/.*?"([a-zA-Z.\d-]*?)".*/g, "$1");
}

/**
 * @param {string} path
 * @return {string}
 */
function getHash(path) {
  const buf = fs.readFileSync(path);
  const hash = crypto.createHash("md5");
  hash.update(buf);
  return hash.digest("hex");
}

function dirSize(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const sizes = entries.map((entry) => {
    const path = pathJoin(dirPath, entry.name);

    if (entry.isFile()) return fs.statSync(path).size;
    else if (entry.isDirectory()) return dirSize(path);
    else return 0;
  });

  return sizes.flat(Infinity).reduce((p, c) => p + c, 0);
}

export async function main() {
  const yarnPath = execCommand("yarn cache dir").toString().trim();

  const yarnHash = getHash("yarn.lock");
  const cargoHash = getHash("src-tauri/Cargo.lock");

  const crateVersions = [];
  crateVersions.push(getCargoCrateVersion("tauri-cli"));

  const targetSize = dirSize("src-tauri/target");

  console.log(`yarnPath=${yarnPath}`);
  console.log(`yarnCacheKey=${yarnHash}`);
  console.log(
    `cargoCacheKey=${cargoHash}-${crateVersions
      .map((it) => it.replace("-", "_"))
      .join("-")}-${targetSize}`
  );
}

main().then();
