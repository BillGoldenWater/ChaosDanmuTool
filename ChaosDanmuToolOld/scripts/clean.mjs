import * as fs from "fs";

if (fs.existsSync("out")) fs.rmdirSync("out", { recursive: true });
