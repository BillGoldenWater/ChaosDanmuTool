// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const changeLog = fs.readFileSync("changeLog.md", {
  flag: "r",
  encoding: "utf-8",
});

console.log(
  "::set-output name=output::" +
    /[\s|\S]+?(?=\*\*\*)/.exec(changeLog)[0].trimEnd()
);
