import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";

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

export async function main() {
  const yarnPath = execCommand("yarn cache dir").toString().trim();

  const yarnHash = getHash("yarn.lock");
  const cargoHash = getHash("src-tauri/Cargo.lock");

  const crateVersions = [];

  crateVersions.push(getCargoCrateVersion("tauri-cli"));

  console.log(`yarnPath=${yarnPath}`);
  console.log(`yarnCacheKey=${yarnHash}`);
  console.log(`cargoCacheKey=${cargoHash}-${crateVersions.join("_")}`);
}

main().then();
