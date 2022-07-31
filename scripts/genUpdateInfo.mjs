/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import fs from "fs/promises";
import path from "path";

async function main() {
    /**
     * @type string
     */
        // noinspection JSFileReferences
    const version = JSON.parse((await fs.readFile("./package.json")).toString()).version
    const changeLog = JSON.parse((await fs.readFile("./changeLog.json")).toString())[version]["content"]

    let platforms = {};

    const infos = (await fs.readdir("out"))
        .filter(value => value.endsWith(".json"))

    for (let info of infos) {
        let data = JSON.parse((await fs.readFile(path.join("out", info))).toString())

        platforms = {...platforms, ...data}
    }

    let data = {
        version,
        notes: changeLog,
        pub_date: new Date().toISOString(),
        platforms
    }

    await fs.writeFile(path.join("out", "updater.json"), JSON.stringify(data))
}

main().then()