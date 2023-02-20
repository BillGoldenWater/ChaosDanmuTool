import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";
// import { join as pathJoin } from "path";
import os from "os";

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommand(command, cwd = undefined) {
  return execSync(command, { cwd });
}

/**
 * @param command {string}
 * @param cwd {string}
 */
function execCommandInheritOut(command, cwd = undefined) {
  console.log(`running ${command}`);
  return execSync(command, { cwd, stdio: "inherit" });
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
  return hash.digest("hex");
}

// /**
//  * @param {string | Buffer | URL} dirPath
//  * @param {Hash | undefined} hash
//  * @return {string}
//  */
// function getHashDir(dirPath, hash) {
//   const root = hash === undefined;
//   const hash_ = root ? crypto.createHash("md5") : hash;
//
//   const entries = fs.readdirSync(dirPath, {withFileTypes: true});
//
//   for (let entry of entries) {
//     const path = pathJoin(dirPath, entry.name);
//
//     if (entry.isFile()) hash_.update(fs.readFileSync(path));
//     else if (entry.isDirectory()) getHashDir(path, hash_);
//   }
//
//   if (root) return hash_.digest("hex");
// }

// /**
//  * @param {string} dirPath
//  */
// function dirSize(dirPath) {
//   if (!fs.existsSync(dirPath)) return 0;
//
//   const entries = fs.readdirSync(dirPath, { withFileTypes: true });
//
//   const sizes = entries.map((entry) => {
//     const path = pathJoin(dirPath, entry.name);
//
//     if (entry.isFile()) return fs.statSync(path).size;
//     else if (entry.isDirectory()) return dirSize(path);
//     else return 0;
//   });
//
//   return sizes.flat(Infinity).reduce((p, c) => p + c, 0);
// }

/**
 * @typedef {Object} CacheItem
 * @property {string} id
 * @property {string[]} paths
 * @property {string} key
 * @property {string[]} restoreKeys
 * @property {(() => void) | undefined} afterRestore
 */

/**
 * @return {CacheItem[]}
 */
export function gen() {
  const yarnPath = execCommand("yarn cache dir").toString().trim();

  const yarnHash = getHash("yarn.lock");
  const cargoLockHash = getHash("src-tauri/Cargo.lock");

  // const backendHash = getHashDir("src-tauri/src");
  const cargoBinHash = getHash(
    `${os.homedir()}/.cargo/.crates.toml`,
    `${os.homedir()}/.cargo/.crates2.json`
  );

  const { platform } = process;

  return [
    {
      id: "yarn",
      paths: [yarnPath],
      key: `yarn-${platform}-${yarnHash}`,
      restoreKeys: [`yarn-${platform}`, `yarn`],
    },
    {
      id: "cargo-registry",
      paths: [
        "~/.cargo/registry/index/",
        "~/.cargo/registry/cache/",
        "~/.cargo/git/db/",
      ],
      key: `cargo-registry-${platform}-${cargoLockHash}`,
      restoreKeys: [`cargo-registry-${platform}`],
    },
    {
      id: "cargo-bin",
      paths: [
        "~/.cargo/bin/",
        "~/.cargo/.crates.toml",
        "~/.cargo/.crates2.json",
      ],
      key: `cargo-bin-${platform}-${cargoBinHash}`,
      restoreKeys: [`cargo-bin-${platform}`],
      afterRestore: () => {
        execCommandInheritOut("cargo install sccache");

        fs.mkdirSync(".cargo", { recursive: true });
        fs.writeFileSync(
          ".cargo/config.toml",
          "[build]\n" + 'rustc-wrapper = "sccache"'
        );
      },
    },
  ];
}

console.log(gen());
