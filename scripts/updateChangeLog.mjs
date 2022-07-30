/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";

async function main() {
  let pkg = JSON.parse((await fs.readFile("package.json")).toString());
  let data = JSON.parse((await fs.readFile("changeLog.json")).toString());

  let date = new Date();
  date = `${date.getFullYear().toString().padStart(4, "0")}.${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;

  // noinspection JSCheckFunctionSignatures
  data[pkg.version] = {
    date: date,
    content: (await fs.readFile("currentChangeLog.md")).toString().trim("\n"),
  };

  await fs.writeFile("changeLog.json", JSON.stringify(data));
}

main().then();
