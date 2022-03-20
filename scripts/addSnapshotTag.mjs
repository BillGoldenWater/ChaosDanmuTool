import crypto from "crypto";
import fs from "fs";
import path from "path"

const outDirName = "out"
const tagName = "snapshot"

fs.readdirSync(outDirName, {withFileTypes: true}).forEach(info => {
    const fileName = info.name;

    if (fileName.startsWith(".")) return
    if (fileName.indexOf(tagName) > -1) return;

    if (info.isFile()) {
        const filePath = path.join(outDirName, fileName)

        const fileBuffer = fs.readFileSync(filePath)
        const hashSum = crypto.createHash('md5');
        hashSum.update(fileBuffer);

        const hex = hashSum.digest('hex');
        const hash = hex.substring(0, 6);

        const extName = path.extname(filePath)
        const targetPath = filePath.replace(extName, `-${tagName}-${hash}${extName}`);
        fs.renameSync(filePath, targetPath);
        console.log(`Tag added: ${targetPath}`)
    }
});
