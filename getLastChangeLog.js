// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const changeLog = fs.readFileSync("changeLog.md", {
  flag: "r",
  encoding: "utf-8",
});

const output = /[\s|\S]+?(?=\*\*\*)/
  .exec(changeLog)[0]
  .trimEnd()
  .replaceAll("%", "%25")
  .replaceAll("\n", "%0A")
  .replaceAll("\r", "%0D");

console.log("::set-output name=changelog::" + output);
