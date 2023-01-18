import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
import { join as pathJoin } from "path";
import os from "os";

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

/**
 * @param {string} dirPath
 */
function dirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const sizes = entries.map((entry) => {
    const path = pathJoin(dirPath, entry.name);

    if (entry.isFile()) return fs.statSync(path).size;
    else if (entry.isDirectory()) return dirSize(path);
    else return 0;
  });

  return sizes.flat(Infinity).reduce((p, c) => p + c, 0);
}

/**
 * @typedef {Object} CacheItem
 * @property {string} id
 * @property {string[]} paths
 * @property {string} key
 * @property {string[]} restoreKeys
 */

/**
 * @return {CacheItem[]}
 */
export function gen() {
  const yarnPath = execCommand("yarn cache dir").toString().trim();

  const yarnHash = getHash("yarn.lock");
  const cargoHash = getHash("src-tauri/Cargo.lock");

  const crateVersions = [];
  crateVersions.push(getCargoCrateVersion("tauri-cli"));
  const versionStr = crateVersions.map((it) => it.replace("-", "_")).join("-");

  const cargoBinSize = dirSize(`${os.homedir()}/.cargo/bin`);
  const targetSize = dirSize("src-tauri/target");

  const platform = process.platform;
  const yarnCacheKey = `yarn-${platform}-${yarnHash}`;
  const cargoCacheKey = `cargo-${platform}-${cargoHash}-${cargoBinSize}-${targetSize}-${versionStr}`;

  return [
    {
      id: "yarn",
      paths: [yarnPath],
      key: yarnCacheKey,
      restoreKeys: [`yarn-${platform}`, `yarn`],
    },
    {
      id: "cargo",
      paths: ["~/.cargo/", "./src-tauri/target/"],
      key: cargoCacheKey,
      restoreKeys: [
        `cargo-${platform}-${cargoHash}-${cargoBinSize}-${targetSize}`,
        `cargo-${platform}-${cargoHash}-${cargoBinSize}`,
        `cargo-${platform}-${cargoHash}`,
        `cargo-${platform}`,
      ],
    },
  ];
}

gen();
