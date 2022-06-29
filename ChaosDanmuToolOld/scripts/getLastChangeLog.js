/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const changeLog = fs.readFileSync("changeLog.md", {
  flag: "r",
  encoding: "utf-8",
});

try {
  const output = /[\s|\S]+?(?=\*\*\*)/
    .exec(changeLog)[0]
    .replace(/(([0-9]+)|(.| )+):/, "")
    .trim()
    .replace(/%/g, "%25")
    .replace(/\n/g, "%0A")
    .replace(/\r/g, "%0D");

  console.log("::set-output name=changelog::" + output);
} catch (e) {
  console.log("::set-output name=changelog::empty");
}
