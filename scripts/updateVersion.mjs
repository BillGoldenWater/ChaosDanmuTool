/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";
import semver from "../frontend/node_modules/semver/index.js";
import toml from "../frontend/node_modules/toml-patch/dist/toml-patch.cjs.min.js";
import { settings } from "./settings.mjs";

/**
 * @param args {string[]}
 */
async function main(args) {
  const pkgPath = settings.frontendFile("package.json");
  const cargoPath = settings.backendFile("Cargo.toml");

  // region process arg
  if (args.length < 1) {
    console.log(
      "<major|minor|patch|build|prerelease|premajor|preminor|prepatch|pre> [ident]"
    );
    return;
  }
  let release = args[0];
  let ident = args[1];
  // endregion

  // region read files
  let pkg_raw = (await fs.readFile(pkgPath)).toString();
  let cargo_raw = (await fs.readFile(cargoPath)).toString();
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
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  await fs.writeFile(cargoPath, toml.patch(cargo_raw, cargo));
  // endregion
}

main(process.argv.slice(2)).then();
