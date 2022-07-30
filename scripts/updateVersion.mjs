/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// noinspection ES6UnusedImports
import fs from "fs/promises";
// noinspection ES6UnusedImports
import semver from "semver";
// noinspection ES6UnusedImports
import toml from "toml-patch";

/**
 * @param args {string[]}
 */
async function main(args) {
  // region process arg
  if (args.length < 1) {
    console.log("<major|minor|patch|build|pre> [ident]");
    return;
  }
  let release = args[0];
  let ident = args[1];
  // endregion

  // region read files
  let pkg_raw = (await fs.readFile("package.json")).toString();
  let cargo_raw = (await fs.readFile("src-tauri/Cargo.toml")).toString();
  let pkg = JSON.parse(pkg_raw);
  let cargo = toml.parse(cargo_raw);
  // endregion

  // noinspection JSCheckFunctionSignatures
  let new_ver = semver
    .parse(pkg["version"])
    .inc(release, ident || "beta")
    .format();
  pkg["version"] = new_ver;
  cargo["package"]["version"] = new_ver;

  // region output
  await fs.writeFile("package.json", JSON.stringify(pkg, null, 2));
  await fs.writeFile("src-tauri/Cargo.toml", toml.patch(cargo_raw, cargo));
  // endregion
}

main(process.argv.slice(2)).then();
