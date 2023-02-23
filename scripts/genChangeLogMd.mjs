/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";
import semver from "../frontend/node_modules/semver";

async function main() {
  let data = JSON.parse((await fs.readFile("changeLog.json")).toString());

  let result = "";

  let sorted_versions = Object.keys(data).sort((a, b) => semver.compare(b, a));

  for (let i = 0; i < sorted_versions.length; i++) {
    let ver = sorted_versions[i];
    let info = data[ver];

    result += `### ${info["date"]} ${ver}:\n\n${info["content"]}\n`;
    if (i < sorted_versions.length - 1) result += `\n***\n\n`;
  }

  await fs.writeFile("changeLog.md", result);
}

main().then();
