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

// /**
//  * @param {string} id
//  * @return {string}
//  */
// function getCargoCrateVersion(id) {
//   const p = execCommand(`cargo search ${id}`);
//   return p
//     .toString()
//     .trim()
//     .replaceAll(/.*?"([a-zA-Z.\d-]*?)".*/g, "$1");
// }

/**
 * @param {string} paths
 * @return {string}
 */
function getHash(...paths) {
  const hash = crypto.createHash("md5");

  for (let path of paths) {
    hash.update(fs.readFileSync(path));
  }

  return hash.digest("hex").slice(0, 8);
}

function getHashDir(dirPath, hash) {
  if (!fs.existsSync(dirPath)) return "00000000";

  const root = hash === undefined;
  const hash_ = root ? crypto.createHash("md5") : hash;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (let entry of entries) {
    const path = pathJoin(dirPath, entry.name);

    if (entry.isFile()) hash_.update(fs.readFileSync(path));
    else if (entry.isDirectory()) getHashDir(path, hash_);
  }

  if (root) return hash_.digest("hex").slice(0, 8);
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
 * @param {string|Buffer|URL} dirPath
 * @return {string[]}
 */
function dirChildren(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const sizes = entries.map((entry) => {
    const path = pathJoin(dirPath, entry.name);

    if (entry.isFile()) return path;
    else if (entry.isDirectory()) return [path, dirChildren(path)];
    else return [];
  });

  return sizes.flat(Infinity);
}

/**
 * @param {string} path
 */
function purgeTarget(path) {
  const entries = dirChildren(path);

  function del(path) {
    if (fs.existsSync(path)) fs.rmSync(path, { recursive: true, force: true });
  }

  const cdtRegex = /.*Chaos.*Danmu.*Tool.*/i;

  for (let entry of entries) {
    let name = entry.split("/").pop();
    switch (name) {
      case "incremental":
      case "bundle":
      case ".rustc_info.json":
        del(entry);
        break;
      default:
        if (name.match(cdtRegex)) {
          del(entry);
        }
    }
  }

  if (fs.existsSync(path))
    fs.writeFileSync(
      pathJoin(path, "rustcVersionVerbose.txt"),
      execCommand("rustc -V -v").toString().trim()
    );
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

  const yarnHash = getHash("frontend/yarn.lock");
  const cargoLockHash = getHash("backend/Cargo.lock");

  const cargoBinHash = getHash(
    `${os.homedir()}/.cargo/.crates.toml`,
    `${os.homedir()}/.cargo/.crates2.json`
  );

  purgeTarget("backend/target");
  const backendHash = getHashDir("backend/src");
  const cargoTargetSize = dirSize("backend/target");

  const { platform } = process;

  /**
   * @param {string} id
   * @param {string} idents
   */
  function genKeys(id, ...idents) {
    const key = `${id}-${idents.join("-")}`;
    let restoreKeys = [];

    idents.pop();
    while (idents.length > 0) {
      restoreKeys.push(`${id}-${idents.join("-")}`);
      idents.pop();
    }

    return {
      key,
      restoreKeys,
    };
  }

  return [
    {
      id: "yarn",
      paths: [yarnPath],
      ...genKeys("yarn", platform, yarnHash),
    },
    {
      id: "cargo",
      paths: ["~/.cargo/"],
      ...genKeys("cargo", platform, cargoLockHash, cargoBinHash),
    },
    {
      id: "cargo-target",
      paths: ["backend/target/"],
      ...genKeys(
        "cargo-target",
        platform,
        cargoLockHash,
        backendHash,
        cargoTargetSize
      ),
    },
  ];
}

console.log(gen());
